import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service.js';
import { toNumber } from '../common/decimals.js';
import { deleteOrDeactivate, type DeletionResult } from '../common/deletion.js';
import {
  type CreateProductDto,
  PRODUCT_SELECT,
  type ProductDto,
  type ProductQueryDto,
  productWhere,
  type UpdateProductDto,
} from '../common/product.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

type Row = Omit<ProductDto, 'price'> & { price: { toString(): string } };
const toDto = (row: Row): ProductDto => ({ ...row, price: toNumber(row.price) });

/** RF04: catálogo de alimentos. */
@Injectable()
export class FoodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categories: CategoriesService,
  ) {}

  async search(query: ProductQueryDto): Promise<ProductDto[]> {
    const rows = await this.prisma.food.findMany({
      where: productWhere(query),
      select: PRODUCT_SELECT,
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
    });
    return rows.map(toDto);
  }

  async findOne(id: number): Promise<ProductDto> {
    const row = await this.prisma.food.findUnique({ where: { id }, select: PRODUCT_SELECT });
    if (!row) throw new NotFoundException('No encontramos ese alimento.');
    return toDto(row);
  }

  async create(dto: CreateProductDto): Promise<ProductDto> {
    await this.categories.ensureUsableFor(dto.categoryId, 'FOOD');
    return toDto(await this.prisma.food.create({ data: dto, select: PRODUCT_SELECT }));
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductDto> {
    const current = await this.findOne(id);
    if (dto.categoryId && dto.categoryId !== current.categoryId) {
      await this.categories.ensureUsableFor(dto.categoryId, 'FOOD');
    }
    return toDto(await this.prisma.food.update({ where: { id }, data: dto, select: PRODUCT_SELECT }));
  }

  /** Relacionados: combos que lo incluyen y comandas que lo vendieron. */
  async remove(id: number): Promise<DeletionResult> {
    const food = await this.findOne(id);
    const { _count } = await this.prisma.food.findUniqueOrThrow({
      where: { id },
      select: { _count: { select: { combos: true, orderItems: true } } },
    });
    return deleteOrDeactivate(
      _count.combos + _count.orderItems,
      `El alimento ${food.name}`,
      () => this.prisma.food.delete({ where: { id } }),
      () => this.prisma.food.update({ where: { id }, data: { status: 'INACTIVE' } }),
    );
  }
}
