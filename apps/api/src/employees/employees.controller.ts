import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentSession, Roles } from '../auth/decorators.js';
import type { EmployeeSession } from '../auth/session.js';
import { DeletionResult } from '../common/deletion.js';
import {
  CreateEmployeeDto,
  EmployeeDto,
  EmployeeQueryDto,
  EmployeeWithPasswordDto,
  UpdateEmployeeDto,
} from './dto.js';
import { EmployeesService } from './employees.service.js';

@ApiTags('employees')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar empleados por nombre de usuario (RDF0304)' })
  @ApiOkResponse({ type: [EmployeeDto] })
  search(@Query() query: EmployeeQueryDto): Promise<EmployeeDto[]> {
    return this.employees.search(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: EmployeeDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EmployeeDto> {
    return this.employees.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar empleado con contraseña aleatoria de 12 caracteres (RDF0301)' })
  @ApiOkResponse({ type: EmployeeWithPasswordDto })
  create(@Body() dto: CreateEmployeeDto): Promise<EmployeeWithPasswordDto> {
    return this.employees.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar empleado, todo excepto el ID (RDF0303)' })
  @ApiOkResponse({ type: EmployeeDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
    @CurrentSession() session: EmployeeSession,
  ): Promise<EmployeeDto> {
    return this.employees.update(id, dto, session.sub);
  }

  @Post(':id/password')
  @ApiOperation({ summary: 'Generar una contraseña nueva de 12 caracteres' })
  @ApiOkResponse({ type: EmployeeWithPasswordDto })
  resetPassword(@Param('id', ParseIntPipe) id: number): Promise<EmployeeWithPasswordDto> {
    return this.employees.resetPassword(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar empleado: se borra o pasa a INACTIVE si tiene relacionados (RDF0302)' })
  @ApiOkResponse({ type: DeletionResult })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentSession() session: EmployeeSession): Promise<DeletionResult> {
    return this.employees.remove(id, session.sub);
  }
}
