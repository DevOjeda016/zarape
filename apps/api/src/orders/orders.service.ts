import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { calculateOrder, canChangeStatus, cardError } from '@zarape/shared';
import { toNumber } from '../common/decimals.js';
import { dayRange, localDay, numberRange } from '../common/local-day.js';
import { Prisma } from '../generated/prisma/client.js';
import type { ProductType } from '../generated/prisma/enums.js';
import type { CardDto } from '../payments/dto.js';
import { simulatePayment } from '../payments/simulator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import type {
  CreateOrderDto,
  OrderDto,
  OrderItemInputDto,
  OrderPaymentDto,
  OrderQueryDto,
  StaffStatus,
  TicketsDto,
} from './dto.js';

const WITH_ITEMS = { items: { orderBy: { id: 'asc' } } } as const;
type OrderRow = Prisma.OrderGetPayload<{ include: typeof WITH_ITEMS }>;

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'pendiente de pago',
  PAID: 'pagada',
  IN_KITCHEN: 'en cocina',
  READY: 'lista',
  DELIVERED: 'entregada',
  CANCELLED: 'cancelada',
};

function toDto(order: OrderRow): OrderDto {
  return {
    id: order.id,
    qrToken: order.qrToken,
    ticketNumber: order.ticketNumber,
    channel: order.channel,
    status: order.status,
    branchId: order.branchId,
    subtotal: toNumber(order.subtotal),
    tax: toNumber(order.tax),
    total: toNumber(order.total),
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    readyAt: order.readyAt,
    deliveredAt: order.deliveredAt,
    items: order.items.map((item) => ({
      id: item.id,
      type: item.type,
      productId: (item.foodId ?? item.drinkId ?? item.comboId)!,
      name: item.name,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      lineTotal: toNumber(item.lineTotal),
    })),
  };
}

/** Comandas: crear al pagar, cambio de estatus, búsqueda, detalle y turnos (RF09–RF11, RF14, RF15). */
@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  /**
   * Comanda del kiosko (RF09, RF12). Recalcula con los precios de la BD, la crea `PENDING`
   * y corre el simulador de pago.
   */
  async create(dto: CreateOrderDto): Promise<OrderPaymentDto> {
    this.ensureCard(dto.card);
    const branch = await this.prisma.branch.findUnique({ where: { id: dto.branchId }, select: { status: true } });
    if (branch?.status !== 'ACTIVE') throw new BadRequestException('Esa sucursal no está disponible.');

    const { lines, subtotal, tax, total } = calculateOrder(await this.priceLines(dto.items));
    const order = await this.prisma.order.create({
      data: {
        channel: 'KIOSK',
        branchId: dto.branchId,
        subtotal,
        tax,
        total,
        items: {
          create: lines.map((line) => ({
            type: line.type,
            foodId: line.type === 'FOOD' ? line.productId : null,
            drinkId: line.type === 'DRINK' ? line.productId : null,
            comboId: line.type === 'COMBO' ? line.productId : null,
            name: line.name,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
          })),
        },
      },
      include: WITH_ITEMS,
    });
    return this.charge(order, dto.card);
  }

  /** Reintento de pago de una comanda que quedó `PENDING` (pago rechazado). */
  async pay(qrToken: string, card: CardDto): Promise<OrderPaymentDto> {
    this.ensureCard(card);
    const order = await this.byToken(qrToken);
    if (order.status !== 'PENDING') throw new ConflictException(`La comanda ya está ${STATUS_LABEL[order.status]}.`);
    return this.charge(order, card);
  }

  /** Comanda por el token de su QR (ticket del comensal, lectura en ventanilla). */
  async findByToken(qrToken: string): Promise<OrderDto> {
    return toDto(await this.byToken(qrToken));
  }

  /** RDF1102: detalle de la comanda. */
  async findOne(id: number): Promise<OrderDto> {
    return toDto(await this.existing(id));
  }

  /** RDF1002: por rango de días o de total. También la cola de cocina (estatus + sucursal). */
  async search(query: OrderQueryDto): Promise<OrderDto[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: dayRange(query.from, query.to),
        total: numberRange(query.minTotal, query.maxTotal),
        status: query.status?.length ? { in: query.status } : undefined,
        branchId: query.branchId,
        channel: query.channel,
      },
      include: WITH_ITEMS,
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return orders.map(toDto);
  }

  /** RF15: cocina toma la comanda, la marca lista (activa el avisador) o se entrega. */
  async changeStatus(id: number, next: StaffStatus): Promise<OrderDto> {
    const current = await this.existing(id);
    if (!canChangeStatus(current.status, next)) {
      throw new ConflictException(
        `La comanda está ${STATUS_LABEL[current.status]}; no puede pasar a ${STATUS_LABEL[next]}.`,
      );
    }
    const now = new Date();
    // El estatus actual va en el filtro: si alguien más la cambió antes, no se pisa
    const { count } = await this.prisma.order.updateMany({
      where: { id, status: current.status },
      data: {
        status: next,
        readyAt: next === 'READY' ? now : undefined,
        deliveredAt: next === 'DELIVERED' ? now : undefined,
      },
    });
    if (count === 0) throw new ConflictException('La comanda cambió hace un momento. Actualiza la lista.');

    const order = await this.existing(id);
    this.realtime.orderChanged(order);
    return toDto(order);
  }

  /** RF14: turnos de hoy de una sucursal, en preparación y listos. */
  async tickets(branchId: number): Promise<TicketsDto> {
    const orders = await this.prisma.order.findMany({
      where: { branchId, ticketDate: localDay(), status: { in: ['PAID', 'IN_KITCHEN', 'READY'] } },
      select: { ticketNumber: true, status: true },
      orderBy: { ticketNumber: 'asc' },
    });
    const numbers = (ready: boolean) =>
      orders.filter((order) => (order.status === 'READY') === ready).map((order) => order.ticketNumber!);
    return { preparing: numbers(false), ready: numbers(true) };
  }

  private ensureCard(card: CardDto): void {
    const error = cardError(card);
    if (error) throw new BadRequestException([error]);
  }

  /** Precio y nombre de cada línea tomados de la BD. Junta las líneas repetidas. */
  private async priceLines(items: OrderItemInputDto[]) {
    const quantities = new Map<string, OrderItemInputDto>();
    for (const item of items) {
      const key = `${item.type}:${item.productId}`;
      const previous = quantities.get(key);
      quantities.set(key, { ...item, quantity: item.quantity + (previous?.quantity ?? 0) });
    }
    const merged = [...quantities.values()];
    const idsOf = (type: ProductType) => merged.filter((item) => item.type === type).map((item) => item.productId);
    const active = (type: ProductType) => ({ id: { in: idsOf(type) }, status: 'ACTIVE' as const });
    const select = { id: true, name: true, price: true } as const;

    const [foods, drinks, combos] = await Promise.all([
      this.prisma.food.findMany({ where: active('FOOD'), select }),
      this.prisma.drink.findMany({ where: active('DRINK'), select }),
      this.prisma.combo.findMany({ where: active('COMBO'), select }),
    ]);
    const catalog = { FOOD: foods, DRINK: drinks, COMBO: combos };

    return merged.map((item) => {
      const product = catalog[item.type].find((row) => row.id === item.productId);
      if (!product) throw new BadRequestException('Un producto de tu comanda ya no está disponible.');
      return { ...item, name: product.name, unitPrice: toNumber(product.price) };
    });
  }

  /** Corre el simulador y guarda el pago. Aprobado: la comanda pasa a `PAID` con su turno. */
  private async charge(order: OrderRow, card: CardDto): Promise<OrderPaymentDto> {
    const { status, message, ...stored } = simulatePayment(card);
    const payment = { orderId: order.id, amount: order.total, status, ...stored };
    const result = { status, message, brand: stored.brand, last4: stored.last4, reference: stored.reference };

    if (status === 'DECLINED') {
      await this.prisma.payment.create({ data: payment });
      return { order: toDto(order), payment: result };
    }

    const paid = await this.markPaid(order, payment);
    this.realtime.orderChanged(paid);
    return { order: toDto(paid), payment: result };
  }

  /**
   * Turno: consecutivo diario por sucursal. Si dos pagos toman el mismo número,
   * el índice único rechaza al segundo y se reintenta con el siguiente.
   */
  private async markPaid(order: OrderRow, payment: Prisma.PaymentUncheckedCreateInput): Promise<OrderRow> {
    const ticketDate = localDay();
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const last = await tx.order.aggregate({
            where: { branchId: order.branchId, ticketDate },
            _max: { ticketNumber: true },
          });
          const { count } = await tx.order.updateMany({
            where: { id: order.id, status: 'PENDING' },
            data: { status: 'PAID', paidAt: new Date(), ticketDate, ticketNumber: (last._max.ticketNumber ?? 0) + 1 },
          });
          if (count === 0) throw new ConflictException('La comanda ya está pagada.');
          await tx.payment.create({ data: payment });
          return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: WITH_ITEMS });
        });
      } catch (error) {
        const taken = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!taken || attempt >= 4) throw error;
      }
    }
  }

  private async existing(id: number): Promise<OrderRow> {
    const order = await this.prisma.order.findUnique({ where: { id }, include: WITH_ITEMS });
    if (!order) throw new NotFoundException('No encontramos esa comanda.');
    return order;
  }

  private async byToken(qrToken: string): Promise<OrderRow> {
    const order = await this.prisma.order.findUnique({ where: { qrToken }, include: WITH_ITEMS });
    if (!order) throw new NotFoundException('No encontramos esa comanda.');
    return order;
  }
}
