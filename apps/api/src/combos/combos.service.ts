import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { aNumero } from '../comun/decimales.js';
import { contiene } from '../comun/consulta.js';
import { eliminarOBaja, type ResultadoEliminacion } from '../comun/eliminacion.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  ActualizarComboDto,
  ComboDto,
  ComponenteDetalleDto,
  ComponenteDto,
  ConsultaCombosDto,
  CrearComboDto,
} from './dto.js';

const PRODUCTO = { select: { id: true, nombre: true, precio: true, estatus: true } } as const;
const CAMPOS = {
  id: true,
  nombre: true,
  descripcion: true,
  fotoUrl: true,
  precio: true,
  estatus: true,
  alimentos: { select: { cantidad: true, alimento: PRODUCTO }, orderBy: { alimento: { nombre: 'asc' } } },
  bebidas: { select: { cantidad: true, bebida: PRODUCTO }, orderBy: { bebida: { nombre: 'asc' } } },
} as const;

type Producto = { id: number; nombre: string; precio: { toString(): string }; estatus: ComboDto['estatus'] };
type Fila = Omit<ComboDto, 'precio' | 'alimentos' | 'bebidas' | 'precioPorSeparado' | 'ahorro'> & {
  precio: { toString(): string };
  alimentos: { cantidad: number; alimento: Producto }[];
  bebidas: { cantidad: number; bebida: Producto }[];
};

const centavos = (valor: number) => Math.round(valor * 100) / 100;

function componente(producto: Producto, cantidad: number): ComponenteDetalleDto {
  return { ...producto, precio: aNumero(producto.precio), cantidad };
}

function aDto(fila: Fila): ComboDto {
  const alimentos = fila.alimentos.map((c) => componente(c.alimento, c.cantidad));
  const bebidas = fila.bebidas.map((c) => componente(c.bebida, c.cantidad));
  const precio = aNumero(fila.precio);
  const precioPorSeparado = centavos([...alimentos, ...bebidas].reduce((suma, c) => suma + c.precio * c.cantidad, 0));
  return { ...fila, precio, alimentos, bebidas, precioPorSeparado, ahorro: centavos(precioPorSeparado - precio) };
}

/** RF06: combos de alimentos y bebidas tomados de sus catálogos. */
@Injectable()
export class CombosService {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(consulta: ConsultaCombosDto): Promise<ComboDto[]> {
    const filas = await this.prisma.combo.findMany({
      where: {
        nombre: contiene(consulta.nombre),
        estatus: consulta.estatus,
        alimentos: consulta.alimento ? { some: { alimento: { nombre: contiene(consulta.alimento) } } } : undefined,
        bebidas: consulta.bebida ? { some: { bebida: { nombre: contiene(consulta.bebida) } } } : undefined,
      },
      select: CAMPOS,
      orderBy: { nombre: 'asc' },
    });
    return filas.map(aDto);
  }

  async obtener(id: number): Promise<ComboDto> {
    const fila = await this.prisma.combo.findUnique({ where: { id }, select: CAMPOS });
    if (!fila) throw new NotFoundException('No encontramos ese combo.');
    return aDto(fila);
  }

  async crear(dto: CrearComboDto): Promise<ComboDto> {
    const alimentos = this.unir(dto.alimentos);
    const bebidas = this.unir(dto.bebidas);
    await this.revisarComponentes(alimentos, bebidas);
    const { id } = await this.prisma.combo.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        fotoUrl: dto.fotoUrl,
        precio: dto.precio,
        alimentos: { create: alimentos.map((c) => ({ alimentoId: c.id, cantidad: c.cantidad })) },
        bebidas: { create: bebidas.map((c) => ({ bebidaId: c.id, cantidad: c.cantidad })) },
      },
      select: { id: true },
    });
    return this.obtener(id);
  }

  async actualizar(id: number, dto: ActualizarComboDto): Promise<ComboDto> {
    const actual = await this.obtener(id);
    const alimentos = dto.alimentos ? this.unir(dto.alimentos) : undefined;
    const bebidas = dto.bebidas ? this.unir(dto.bebidas) : undefined;
    if (alimentos || bebidas) {
      await this.revisarComponentes(
        alimentos ?? actual.alimentos,
        bebidas ?? actual.bebidas,
        new Set([...actual.alimentos.map((c) => `A${c.id}`), ...actual.bebidas.map((c) => `B${c.id}`)]),
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.combo.update({
        where: { id },
        data: {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          fotoUrl: dto.fotoUrl,
          precio: dto.precio,
          estatus: dto.estatus,
        },
      });
      if (alimentos) {
        await tx.comboAlimento.deleteMany({ where: { comboId: id } });
        await tx.comboAlimento.createMany({
          data: alimentos.map((c) => ({ comboId: id, alimentoId: c.id, cantidad: c.cantidad })),
        });
      }
      if (bebidas) {
        await tx.comboBebida.deleteMany({ where: { comboId: id } });
        await tx.comboBebida.createMany({
          data: bebidas.map((c) => ({ comboId: id, bebidaId: c.id, cantidad: c.cantidad })),
        });
      }
    });
    return this.obtener(id);
  }

  /** Relacionados: comandas que lo vendieron. Sus componentes se borran en cascada. */
  async eliminar(id: number): Promise<ResultadoEliminacion> {
    const combo = await this.obtener(id);
    const detalles = await this.prisma.detalleComanda.count({ where: { comboId: id } });
    return eliminarOBaja(
      detalles,
      `El combo ${combo.nombre}`,
      () => this.prisma.combo.delete({ where: { id } }),
      () => this.prisma.combo.update({ where: { id }, data: { estatus: 'BAJA' } }),
    );
  }

  /** Si el mismo producto viene dos veces, suma las cantidades. */
  private unir(componentes: ComponenteDto[]): ComponenteDto[] {
    const porId = new Map<number, number>();
    for (const c of componentes) porId.set(c.id, (porId.get(c.id) ?? 0) + c.cantidad);
    return [...porId].map(([id, cantidad]) => ({ id, cantidad }));
  }

  /**
   * Al menos un producto; todos existen y están activos. Al modificar, un producto que ya estaba
   * en el combo y luego se dio de baja puede quedarse (se marca en la UI), pero no se agregan nuevos en baja.
   */
  private async revisarComponentes(
    alimentos: { id: number }[],
    bebidas: { id: number }[],
    yaIncluidos = new Set<string>(),
  ): Promise<void> {
    if (alimentos.length + bebidas.length === 0) {
      throw new BadRequestException('Agrega al menos un alimento o una bebida al combo.');
    }
    const [filasA, filasB] = await Promise.all([
      this.prisma.alimento.findMany({ where: { id: { in: alimentos.map((c) => c.id) } } }),
      this.prisma.bebida.findMany({ where: { id: { in: bebidas.map((c) => c.id) } } }),
    ]);
    if (filasA.length !== alimentos.length) throw new BadRequestException('Uno de los alimentos no existe.');
    if (filasB.length !== bebidas.length) throw new BadRequestException('Una de las bebidas no existe.');

    const enBaja = [
      ...filasA.filter((p) => p.estatus !== 'ACTIVO' && !yaIncluidos.has(`A${p.id}`)),
      ...filasB.filter((p) => p.estatus !== 'ACTIVO' && !yaIncluidos.has(`B${p.id}`)),
    ];
    if (enBaja.length) {
      throw new BadRequestException(`${enBaja.map((p) => p.nombre).join(', ')} está dado de baja.`);
    }
  }
}
