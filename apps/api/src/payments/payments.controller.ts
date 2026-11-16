import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators.js';
import { PaymentDto, PaymentQueryDto } from './dto.js';
import { PaymentsService } from './payments.service.js';

@ApiTags('payments')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar pagos por rango de fechas o de cantidad (RDF130102)' })
  @ApiOkResponse({ type: [PaymentDto] })
  search(@Query() query: PaymentQueryDto): Promise<PaymentDto[]> {
    return this.payments.search(query);
  }
}
