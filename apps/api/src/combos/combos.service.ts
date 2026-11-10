import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { toNumber } from '../common/decimals.js';
import { deleteOrDeactivate, type DeletionResult } from '../common/deletion.js';
import { containsText } from '../common/query.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  ComboDto,
  ComboItemDetailDto,
  ComboItemDto,
  ComboQueryDto,
  CreateComboDto,
  UpdateComboDto,
} from './dto.js';

const PRODUCT = { select: { id: true, name: true, price: true, status: true } } as const;
const COMBO_SELECT = {
  id: true,
  name: true,
  description: true,
  photoUrl: true,
  price: true,
  status: true,
  foods: { select: { quantity: true, food: PRODUCT }, orderBy: { food: { name: 'asc' } } },
  drinks: { select: { quantity: true, drink: PRODUCT }, orderBy: { drink: { name: 'asc' } } },
} as const;

type Product = { id: number; name: string; price: { toString(): string }; status: ComboDto['status'] };
type Row = Omit<ComboDto, 'price' | 'foods' | 'drinks' | 'separatePrice' | 'savings'> & {
  price: { toString(): string };
  foods: { quantity: number; food: Product }[];
  drinks: { quantity: number; drink: Product }[];
};

const roundCents = (value: number) => Math.round(value * 100) / 100;

function toItem(product: Product, quantity: number): ComboItemDetailDto {
  return { ...product, price: toNumber(product.price), quantity };
}

function toDto(row: Row): ComboDto {
  const foods = row.foods.map((c) => toItem(c.food, c.quantity));
  const drinks = row.drinks.map((c) => toItem(c.drink, c.quantity));
  const price = toNumber(row.price);
  const separatePrice = roundCents([...foods, ...drinks].reduce((sum, c) => sum + c.price * c.quantity, 0));
  return { ...row, price, foods, drinks, separatePrice, savings: roundCents(separatePrice - price) };
}

/** RF06: combos de alimentos y bebidas tomados de sus catálogos. */
@Injectable()
export class CombosService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: ComboQueryDto): Promise<ComboDto[]> {
    const rows = await this.prisma.combo.findMany({
      where: {
        name: containsText(query.name),
        status: query.status,
        foods: query.food ? { some: { food: { name: containsText(query.food) } } } : undefined,
        drinks: query.drink ? { some: { drink: { name: containsText(query.drink) } } } : undefined,
      },
      select: COMBO_SELECT,
      orderBy: { name: 'asc' },
    });
    return rows.map(toDto);
  }

  async findOne(id: number): Promise<ComboDto> {
    const row = await this.prisma.combo.findUnique({ where: { id }, select: COMBO_SELECT });
    if (!row) throw new NotFoundException('No encontramos ese combo.');
    return toDto(row);
  }

  async create(dto: CreateComboDto): Promise<ComboDto> {
    const foods = this.merge(dto.foods);
    const drinks = this.merge(dto.drinks);
    await this.ensureItems(foods, drinks);
    const { id } = await this.prisma.combo.create({
      data: {
        name: dto.name,
        description: dto.description,
        photoUrl: dto.photoUrl,
        price: dto.price,
        foods: { create: foods.map((c) => ({ foodId: c.id, quantity: c.quantity })) },
        drinks: { create: drinks.map((c) => ({ drinkId: c.id, quantity: c.quantity })) },
      },
      select: { id: true },
    });
    return this.findOne(id);
  }

  async update(id: number, dto: UpdateComboDto): Promise<ComboDto> {
    const current = await this.findOne(id);
    const foods = dto.foods ? this.merge(dto.foods) : undefined;
    const drinks = dto.drinks ? this.merge(dto.drinks) : undefined;
    if (foods || drinks) {
      await this.ensureItems(
        foods ?? current.foods,
        drinks ?? current.drinks,
        new Set([...current.foods.map((c) => `F${c.id}`), ...current.drinks.map((c) => `D${c.id}`)]),
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.combo.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          photoUrl: dto.photoUrl,
          price: dto.price,
          status: dto.status,
        },
      });
      if (foods) {
        await tx.comboFood.deleteMany({ where: { comboId: id } });
        await tx.comboFood.createMany({ data: foods.map((c) => ({ comboId: id, foodId: c.id, quantity: c.quantity })) });
      }
      if (drinks) {
        await tx.comboDrink.deleteMany({ where: { comboId: id } });
        await tx.comboDrink.createMany({
          data: drinks.map((c) => ({ comboId: id, drinkId: c.id, quantity: c.quantity })),
        });
      }
    });
    return this.findOne(id);
  }

  /** Relacionados: comandas que lo vendieron. Sus componentes se borran en cascada. */
  async remove(id: number): Promise<DeletionResult> {
    const combo = await this.findOne(id);
    const orderItems = await this.prisma.orderItem.count({ where: { comboId: id } });
    return deleteOrDeactivate(
      orderItems,
      `El combo ${combo.name}`,
      () => this.prisma.combo.delete({ where: { id } }),
      () => this.prisma.combo.update({ where: { id }, data: { status: 'INACTIVE' } }),
    );
  }

  /** Si el mismo producto viene dos veces, suma las cantidades. */
  private merge(items: ComboItemDto[]): ComboItemDto[] {
    const byId = new Map<number, number>();
    for (const c of items) byId.set(c.id, (byId.get(c.id) ?? 0) + c.quantity);
    return [...byId].map(([id, quantity]) => ({ id, quantity }));
  }

  /**
   * Al menos un producto; todos existen y están activos. Al modificar, un producto que ya estaba
   * en el combo y luego se dio de baja puede quedarse (se marca en la UI), pero no se agregan nuevos en baja.
   */
  private async ensureItems(
    foods: { id: number }[],
    drinks: { id: number }[],
    alreadyIncluded = new Set<string>(),
  ): Promise<void> {
    if (foods.length + drinks.length === 0) {
      throw new BadRequestException('Agrega al menos un alimento o una bebida al combo.');
    }
    const [foodRows, drinkRows] = await Promise.all([
      this.prisma.food.findMany({ where: { id: { in: foods.map((c) => c.id) } } }),
      this.prisma.drink.findMany({ where: { id: { in: drinks.map((c) => c.id) } } }),
    ]);
    if (foodRows.length !== foods.length) throw new BadRequestException('Uno de los alimentos no existe.');
    if (drinkRows.length !== drinks.length) throw new BadRequestException('Una de las bebidas no existe.');

    const inactive = [
      ...foodRows.filter((p) => p.status !== 'ACTIVE' && !alreadyIncluded.has(`F${p.id}`)),
      ...drinkRows.filter((p) => p.status !== 'ACTIVE' && !alreadyIncluded.has(`D${p.id}`)),
    ];
    if (inactive.length) {
      throw new BadRequestException(`${inactive.map((p) => p.name).join(', ')} está dado de baja.`);
    }
  }
}
