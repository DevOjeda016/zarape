import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public, Roles } from '../auth/decorators.js';
import {
  ChangeStatusDto,
  CreateOrderDto,
  OrderDto,
  OrderPaymentDto,
  OrderQueryDto,
  PayOrderDto,
  TicketsDto,
  TicketsQueryDto,
} from './dto.js';
import { OrdersService } from './orders.service.js';

/**
 * Comandas. El comensal del kiosko no tiene cuenta (RF08): crea, paga y sigue su comanda
 * por el token del QR. Buscar y cambiar estatus es del personal.
 */
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Crear la comanda del kiosko y pagarla en el simulador (RF09, RF12)' })
  @ApiOkResponse({ type: OrderPaymentDto })
  create(@Body() dto: CreateOrderDto): Promise<OrderPaymentDto> {
    return this.orders.create(dto);
  }

  @Public()
  @Get('tickets')
  @ApiOperation({ summary: 'Turnos de hoy en preparación y listos (RF14)' })
  @ApiOkResponse({ type: TicketsDto })
  tickets(@Query() query: TicketsQueryDto): Promise<TicketsDto> {
    return this.orders.tickets(query.branchId);
  }

  @Public()
  @Get('by-token/:qrToken')
  @ApiOperation({ summary: 'Comanda por el token de su QR' })
  @ApiOkResponse({ type: OrderDto })
  findByToken(@Param('qrToken', ParseUUIDPipe) qrToken: string): Promise<OrderDto> {
    return this.orders.findByToken(qrToken);
  }

  @Public()
  @Post('by-token/:qrToken/payments')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reintentar el pago de una comanda pendiente (RF12)' })
  @ApiOkResponse({ type: OrderPaymentDto })
  pay(@Param('qrToken', ParseUUIDPipe) qrToken: string, @Body() dto: PayOrderDto): Promise<OrderPaymentDto> {
    return this.orders.pay(qrToken, dto.card);
  }

  @Get()
  @Roles('ADMIN', 'KITCHEN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar comandas por rango de días o de total (RDF1002); cola de cocina (RF15)' })
  @ApiOkResponse({ type: [OrderDto] })
  search(@Query() query: OrderQueryDto): Promise<OrderDto[]> {
    return this.orders.search(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'KITCHEN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalle de la comanda (RDF1102)' })
  @ApiOkResponse({ type: OrderDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderDto> {
    return this.orders.findOne(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'KITCHEN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar estatus: en cocina, lista (activa el avisador), entregada o cancelada (RF15, RF20)' })
  @ApiOkResponse({ type: OrderDto })
  changeStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangeStatusDto): Promise<OrderDto> {
    return this.orders.changeStatus(id, dto.status);
  }
}
