import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { deleteOrDeactivate, type DeletionResult } from '../common/deletion.js';
import { containsText } from '../common/query.js';
import type { CategoryType } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CategoryDto, CategoryQueryDto, CreateCategoryDto, UpdateCategoryDto } from './dto.js';

const CATEGORY_SELECT = {
  id: true,
  name: true,
  type: true,
  status: true,
  _count: { select: { foods: true, drinks: true } },
} as const;

type CategoryRow = Omit<CategoryDto, 'productCount'> & { _count: { foods: number; drinks: number } };

function toDto({ _count, ...category }: CategoryRow): CategoryDto {
  return { ...category, productCount: _count.foods + _count.drinks };
}

/** Categorías de alimentos (RF04) y de bebidas (RF05). */
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: CategoryQueryDto): Promise<CategoryDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { type: query.type, name: containsText(query.name), status: query.status },
      select: CATEGORY_SELECT,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
    return categories.map(toDto);
  }

  async findOne(id: number): Promise<CategoryDto> {
    const category = await this.prisma.category.findUnique({ where: { id }, select: CATEGORY_SELECT });
    if (!category) throw new NotFoundException('No encontramos esa categoría.');
    return toDto(category);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDto> {
    return toDto(await this.prisma.category.create({ data: dto, select: CATEGORY_SELECT }));
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryDto> {
    const current = await this.findOne(id);
    if (dto.type && dto.type !== current.type && current.productCount > 0) {
      throw new BadRequestException('La categoría ya tiene productos; no puede cambiar de alimentos a bebidas.');
    }
    return toDto(await this.prisma.category.update({ where: { id }, data: dto, select: CATEGORY_SELECT }));
  }

  async remove(id: number): Promise<DeletionResult> {
    const category = await this.findOne(id);
    return deleteOrDeactivate(
      category.productCount,
      `La categoría ${category.name}`,
      () => this.prisma.category.delete({ where: { id } }),
      () => this.prisma.category.update({ where: { id }, data: { status: 'INACTIVE' } }),
    );
  }

  /** Para alimentos y bebidas: la categoría existe, está activa y es del tipo correcto. */
  async ensureUsableFor(categoryId: number, type: CategoryType): Promise<void> {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('Esa categoría no existe.');
    if (category.type !== type) {
      throw new BadRequestException(type === 'FOOD' ? 'Elige una categoría de alimentos.' : 'Elige una categoría de bebidas.');
    }
    if (category.status !== 'ACTIVE') throw new BadRequestException('Esa categoría está dada de baja.');
  }
}
