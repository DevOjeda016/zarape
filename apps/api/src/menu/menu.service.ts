import { Injectable } from '@nestjs/common';
import { toNumber } from '../common/decimals.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { MenuBranchDto, MenuDto } from './dto.js';

const PRODUCT = {
  where: { status: 'ACTIVE', category: { status: 'ACTIVE' } },
  select: {
    id: true,
    name: true,
    description: true,
    photoUrl: true,
    price: true,
    category: { select: { id: true, name: true } },
  },
  orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
} satisfies Prisma.FoodFindManyArgs & Prisma.DrinkFindManyArgs;

const PART = { select: { quantity: true } } as const;

/** Menú público: solo lo activo, con precios de la BD. */
@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async find(): Promise<MenuDto> {
    const [foods, drinks, combos] = await Promise.all([
      this.prisma.food.findMany(PRODUCT),
      this.prisma.drink.findMany(PRODUCT),
      this.prisma.combo.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          description: true,
          photoUrl: true,
          price: true,
          foods: { select: { ...PART.select, food: { select: { name: true } } } },
          drinks: { select: { ...PART.select, drink: { select: { name: true } } } },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      foods: foods.map((food) => ({ ...food, price: toNumber(food.price) })),
      drinks: drinks.map((drink) => ({ ...drink, price: toNumber(drink.price) })),
      combos: combos.map(({ foods: comboFoods, drinks: comboDrinks, ...combo }) => ({
        ...combo,
        price: toNumber(combo.price),
        contents: [
          ...comboFoods.map((part) => ({ name: part.food.name, quantity: part.quantity })),
          ...comboDrinks.map((part) => ({ name: part.drink.name, quantity: part.quantity })),
        ],
      })),
    };
  }

  async branches(): Promise<MenuBranchDto[]> {
    const branches = await this.prisma.branch.findMany({
      where: { status: 'ACTIVE' },
      omit: { status: true },
      orderBy: { name: 'asc' },
    });
    return branches.map((branch) => ({
      ...branch,
      latitude: toNumber(branch.latitude),
      longitude: toNumber(branch.longitude),
    }));
  }
}
