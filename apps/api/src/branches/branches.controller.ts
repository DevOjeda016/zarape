import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators.js';
import { DeletionResult } from '../common/deletion.js';
import { BranchesService } from './branches.service.js';
import { BranchDto, BranchQueryDto, CreateBranchDto, UpdateBranchDto } from './dto.js';

@ApiTags('branches')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branches: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar sucursales por nombre o ubicación (RDF0204)' })
  @ApiOkResponse({ type: [BranchDto] })
  search(@Query() query: BranchQueryDto): Promise<BranchDto[]> {
    return this.branches.search(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: BranchDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<BranchDto> {
    return this.branches.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar sucursal (RDF0201)' })
  @ApiOkResponse({ type: BranchDto })
  create(@Body() dto: CreateBranchDto): Promise<BranchDto> {
    return this.branches.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar sucursal, todo excepto el ID (RDF0203)' })
  @ApiOkResponse({ type: BranchDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBranchDto): Promise<BranchDto> {
    return this.branches.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar sucursal: se borra o pasa a INACTIVE si tiene relacionados (RDF0202)' })
  @ApiOkResponse({ type: DeletionResult })
  remove(@Param('id', ParseIntPipe) id: number): Promise<DeletionResult> {
    return this.branches.remove(id);
  }
}
