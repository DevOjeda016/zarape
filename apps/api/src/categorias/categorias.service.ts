import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { contiene } from '../comun/consulta.js';
import { eliminarOBaja, type ResultadoEliminacion } from '../comun/eliminacion.js';
import type { TipoCategoria } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ActualizarCategoriaDto, CategoriaDto, ConsultaCategoriasDto, CrearCategoriaDto } from './dto.js';

const CAMPOS = {
  id: true,
  nombre: true,
  tipo: true,
  estatus: true,
  _count: { select: { alimentos: true, bebidas: true } },
} as const;

type CategoriaConConteo = {
  id: number;
  nombre: string;
  tipo: TipoCategoria;
  estatus: CategoriaDto['estatus'];
  _count: { alimentos: number; bebidas: number };
};

function aDto({ _count, ...categoria }: CategoriaConConteo): CategoriaDto {
  return { ...categoria, productos: _count.alimentos + _count.bebidas };
}

/** Categorías de alimentos (RF04) y de bebidas (RF05). */
@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(consulta: ConsultaCategoriasDto): Promise<CategoriaDto[]> {
    const categorias = await this.prisma.categoria.findMany({
      where: { tipo: consulta.tipo, nombre: contiene(consulta.nombre), estatus: consulta.estatus },
      select: CAMPOS,
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    });
    return categorias.map(aDto);
  }

  async obtener(id: number): Promise<CategoriaDto> {
    const categoria = await this.prisma.categoria.findUnique({ where: { id }, select: CAMPOS });
    if (!categoria) throw new NotFoundException('No encontramos esa categoría.');
    return aDto(categoria);
  }

  async crear(dto: CrearCategoriaDto): Promise<CategoriaDto> {
    return aDto(await this.prisma.categoria.create({ data: dto, select: CAMPOS }));
  }

  async actualizar(id: number, dto: ActualizarCategoriaDto): Promise<CategoriaDto> {
    const actual = await this.obtener(id);
    if (dto.tipo && dto.tipo !== actual.tipo && actual.productos > 0) {
      throw new BadRequestException('La categoría ya tiene productos; no puede cambiar de alimentos a bebidas.');
    }
    return aDto(await this.prisma.categoria.update({ where: { id }, data: dto, select: CAMPOS }));
  }

  async eliminar(id: number): Promise<ResultadoEliminacion> {
    const categoria = await this.obtener(id);
    return eliminarOBaja(
      categoria.productos,
      `La categoría ${categoria.nombre}`,
      () => this.prisma.categoria.delete({ where: { id } }),
      () => this.prisma.categoria.update({ where: { id }, data: { estatus: 'BAJA' } }),
    );
  }

  /** Para alimentos y bebidas: la categoría existe, está activa y es del tipo correcto. */
  async revisarParaProducto(categoriaId: number, tipo: TipoCategoria): Promise<void> {
    const categoria = await this.prisma.categoria.findUnique({ where: { id: categoriaId } });
    if (!categoria) throw new BadRequestException('Esa categoría no existe.');
    if (categoria.tipo !== tipo) {
      throw new BadRequestException(
        tipo === 'ALIMENTO' ? 'Elige una categoría de alimentos.' : 'Elige una categoría de bebidas.',
      );
    }
    if (categoria.estatus !== 'ACTIVO') throw new BadRequestException('Esa categoría está dada de baja.');
  }
}
