import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { Trim } from '../common/query.js';
import { PaymentStatus } from '../generated/prisma/enums.js';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MESSAGE = 'La fecha va como AAAA-MM-DD.';

/** RF13: tarjeta para el simulador. El número y el CVV se validan y se descartan. */
export class CardDto {
  @ApiProperty({ example: '4242 4242 4242 4242', description: 'Tarjeta de prueba. No se guarda.' })
  @IsString()
  @IsNotEmpty({ message: 'Escribe el número de la tarjeta.' })
  @MaxLength(23)
  number: string;

  @ApiProperty({ example: 'John Doe' })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Escribe el nombre del titular.' })
  @MaxLength(100)
  holderName: string;

  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt({ message: 'Revisa el mes de vencimiento.' })
  @Min(1, { message: 'Revisa el mes de vencimiento.' })
  @Max(12, { message: 'Revisa el mes de vencimiento.' })
  expMonth: number;

  @ApiProperty({ example: 28, description: 'Año con 2 o 4 dígitos.' })
  @Type(() => Number)
  @IsInt({ message: 'Revisa el año de vencimiento.' })
  @Min(0, { message: 'Revisa el año de vencimiento.' })
  @Max(2099, { message: 'Revisa el año de vencimiento.' })
  expYear: number;

  @ApiProperty({ example: '123', description: 'No se guarda.' })
  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'Revisa el CVV.' })
  cvv: string;
}

/** RDF130102: pagos por rango de fechas o de cantidad. */
export class PaymentQueryDto {
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

  @ApiPropertyOptional({ description: 'Cantidad mínima (incluida).' })
  @IsOptional()
  @Trim()
  @Type(() => Number)
  @IsNumber()
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Cantidad máxima (incluida).' })
  @IsOptional()
  @Trim()
  @Type(() => Number)
  @IsNumber()
  maxAmount?: number;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @Trim()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

/** RF13: lo que se guarda de un pago. Sin número completo ni CVV. */
export class PaymentDto {
  @ApiProperty() id: number;
  @ApiProperty() orderId: number;
  @ApiProperty() holderName: string;
  @ApiProperty() brand: string;
  @ApiProperty({ example: '4242' }) last4: string;
  @ApiProperty() expMonth: number;
  @ApiProperty() expYear: number;
  @ApiProperty() amount: number;
  @ApiProperty({ enum: PaymentStatus }) status: PaymentStatus;
  @ApiProperty() reference: string;
  @ApiProperty() paidAt: Date;
}
