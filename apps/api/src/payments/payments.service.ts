import { Injectable } from '@nestjs/common';
import { toNumber } from '../common/decimals.js';
import { dayRange, numberRange } from '../common/local-day.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PaymentDto, PaymentQueryDto } from './dto.js';

/** RF13: consulta de pagos. Los pagos se crean al cobrar una comanda (OrdersService). */
@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** RDF130102: por rango de fechas o de cantidad. */
  async search(query: PaymentQueryDto): Promise<PaymentDto[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        paidAt: dayRange(query.from, query.to),
        amount: numberRange(query.minAmount, query.maxAmount),
        status: query.status,
      },
      orderBy: { paidAt: 'desc' },
      take: 500,
    });
    return payments.map((payment) => ({ ...payment, amount: toNumber(payment.amount) }));
  }
}
