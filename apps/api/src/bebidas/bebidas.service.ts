import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriasService } from '../categorias/categorias.service.js';
import { aNumero } from '../comun/decimales.js';
import { eliminarOBaja, type ResultadoEliminacion } from '../comun/eliminacion.js';
import {
  type ActualizarProductoDto,
  CAMPOS_PRODUCTO,
  type ConsultaProductosDto,
  type CrearProductoDto,
  filtroProductos,
  type ProductoDto,
} from '../comun/producto.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

type Fila = Omit<ProductoDto, 'precio'> & { precio: { toString(): string } };
const aDto = (fila: Fila): ProductoDto => ({ ...fila, precio: aNumero(fila.precio) });

/** RF05: catálogo de bebidas. */
@Injectable()
export class BebidasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categorias: CategoriasService,
  ) {}

  async buscar(consulta: ConsultaProductosDto): Promise<ProductoDto[]> {
    const filas = await this.prisma.bebida.findMany({
      where: filtroProductos(consulta),
      select: CAMPOS_PRODUCTO,
      orderBy: [{ categoria: { nombre: 'asc' } }, { nombre: 'asc' }],
    });
    return filas.map(aDto);
  }

  async obtener(id: number): Promise<ProductoDto> {
    const fila = await this.prisma.bebida.findUnique({ where: { id }, select: CAMPOS_PRODUCTO });
    if (!fila) throw new NotFoundException('No encontramos esa bebida.');
    return aDto(fila);
  }

  async crear(dto: CrearProductoDto): Promise<ProductoDto> {
    await this.categorias.revisarParaProducto(dto.categoriaId, 'BEBIDA');
    return aDto(await this.prisma.bebida.create({ data: dto, select: CAMPOS_PRODUCTO }));
  }

  async actualizar(id: number, dto: ActualizarProductoDto): Promise<ProductoDto> {
    const actual = await this.obtener(id);
    if (dto.categoriaId && dto.categoriaId !== actual.categoriaId) {
      await this.categorias.revisarParaProducto(dto.categoriaId, 'BEBIDA');
    }
    return aDto(await this.prisma.bebida.update({ where: { id }, data: dto, select: CAMPOS_PRODUCTO }));
  }

  /** Relacionados: combos que lo incluyen y comandas que lo vendieron. */
  async eliminar(id: number): Promise<ResultadoEliminacion> {
    const bebida = await this.obtener(id);
    const { _count } = await this.prisma.bebida.findUniqueOrThrow({
      where: { id },
      select: { _count: { select: { combos: true, detalles: true } } },
    });
    return eliminarOBaja(
      _count.combos + _count.detalles,
      `La bebida ${bebida.nombre}`,
      () => this.prisma.bebida.delete({ where: { id } }),
      () => this.prisma.bebida.update({ where: { id }, data: { estatus: 'BAJA' } }),
    );
  }
}
