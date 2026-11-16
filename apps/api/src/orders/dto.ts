import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Trim } from '../common/query.js';
import { Channel, OrderStatus, PaymentStatus, ProductType } from '../generated/prisma/enums.js';
import { CardDto } from '../payments/dto.js';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MESSAGE = 'La fecha va como AAAA-MM-DD.';

/** Estatus que puede poner el personal. `PAID` solo lo pone el pago. */
export const STAFF_STATUSES = ['IN_KITCHEN', 'READY', 'DELIVERED', 'CANCELLED'] as const;
export type StaffStatus = (typeof STAFF_STATUSES)[number];

/** Una línea del pedido: solo qué producto y cuántos. El precio lo pone la API. */
export class OrderItemInputDto {
  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType, { message: 'El tipo de producto no existe.' })
  type: ProductType;

  @ApiProperty({ example: 1, description: 'ID del alimento, bebida o combo, según `type`.' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @Min(1, { message: 'La cantidad mínima es 1.' })
  @Max(99, { message: 'La cantidad máxima es 99.' })
  quantity: number;
}

/** RF09 + RF12: comanda del kiosko con su pago. Los totales se recalculan con la BD. */
export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Elige una sucursal.' })
  @IsPositive({ message: 'Elige una sucursal.' })
  branchId: number;

  @ApiProperty({ type: [OrderItemInputDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'La comanda está vacía.' })
  @ArrayMaxSize(50, { message: 'La comanda tiene demasiados productos.' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @ApiProperty({ type: CardDto })
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;
}

/** Reintento de pago de una comanda que quedó pendiente. */
export class PayOrderDto {
  @ApiProperty({ type: CardDto })
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;
}

export class ChangeStatusDto {
  @ApiProperty({ enum: STAFF_STATUSES })
  @IsIn(STAFF_STATUSES, { message: 'Ese estatus no se puede poner a mano.' })
  status: StaffStatus;
}

/** RDF1002: comandas por rango de días o de total. */
export class OrderQueryDto {
  @ApiPropertyOptional({ example: '2026-11-01', description: 'Desde este día (incluido).' })
  @IsOptional()
  @Trim()
  @Matches(DAY, { message: DAY_MESSAGE })
  from?: string;

  @ApiPropertyOptional({ example: '2026-11-30', description: 'Hasta este día (incluido).' })
  @IsOptional()
  @Trim()
  @Matches(DAY, { message: DAY_MESSAGE })
  to?: string;

  @ApiPropertyOptional({ description: 'Total a pagar mínimo (incluido).' })
  @IsOptional()
  @Trim()
  @Type(() => Number)
  @IsNumber()
  minTotal?: number;

  @ApiPropertyOptional({ description: 'Total a pagar máximo (incluido).' })
  @IsOptional()
  @Trim()
  @Type(() => Number)
  @IsNumber()
  maxTotal?: number;

  @ApiPropertyOptional({ enum: OrderStatus, isArray: true, description: 'Uno o varios, separados por coma.' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').map((status) => status.trim()).filter(Boolean) : value,
  )
  @IsEnum(OrderStatus, { each: true })
  status?: OrderStatus[];

  @ApiPropertyOptional()
  @IsOptional()
  @Trim()
  @Type(() => Number)
  @IsInt()
  branchId?: number;

  @ApiPropertyOptional({ enum: Channel })
  @IsOptional()
  @Trim()
  @IsEnum(Channel)
  channel?: Channel;
}

export class TicketsQueryDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Elige una sucursal.' })
  @IsPositive({ message: 'Elige una sucursal.' })
  branchId: number;
}

/** RF11: detalle de la comanda. Nombre y precio son los del momento de la compra. */
export class OrderItemDto {
  @ApiProperty() id: number;
  @ApiProperty({ enum: ProductType }) type: ProductType;
  @ApiProperty({ description: 'ID del alimento, bebida o combo.' }) productId: number;
  @ApiProperty() name: string;
  @ApiProperty() quantity: number;
  @ApiProperty() unitPrice: number;
  @ApiProperty() lineTotal: number;
}

/** RF10: comanda. */
export class OrderDto {
  @ApiProperty() id: number;
  @ApiProperty({ description: 'Token del QR (UUID).' }) qrToken: string;
  @ApiProperty({ nullable: true, description: 'Turno del día; se asigna al pagar.' }) ticketNumber: number | null;
  @ApiProperty({ enum: Channel }) channel: Channel;
  @ApiProperty({ enum: OrderStatus }) status: OrderStatus;
  @ApiProperty() branchId: number;
  @ApiProperty() subtotal: number;
  @ApiProperty({ description: 'IVA.' }) tax: number;
  @ApiProperty({ description: 'Total a pagar.' }) total: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ nullable: true }) paidAt: Date | null;
  @ApiProperty({ nullable: true }) readyAt: Date | null;
  @ApiProperty({ nullable: true }) deliveredAt: Date | null;
  @ApiProperty({ type: [OrderItemDto] }) items: OrderItemDto[];
}

export class PaymentResultDto {
  @ApiProperty({ enum: PaymentStatus }) status: PaymentStatus;
  @ApiProperty({ nullable: true, description: 'Por qué no pasó el pago.' }) message: string | null;
  @ApiProperty() brand: string;
  @ApiProperty() last4: string;
  @ApiProperty() reference: string;
}

/** Comanda + resultado del pago. Pago rechazado: la comanda sigue `PENDING` y se puede reintentar. */
export class OrderPaymentDto {
  @ApiProperty({ type: OrderDto }) order: OrderDto;
  @ApiProperty({ type: PaymentResultDto }) payment: PaymentResultDto;
}

/** RF14: turnos del día para la pantalla del avisador. */
export class TicketsDto {
  @ApiProperty({ type: [Number], description: 'Turnos pagados o en cocina.' }) preparing: number[];
  @ApiProperty({ type: [Number], description: 'Turnos listos para recoger.' }) ready: number[];
}
