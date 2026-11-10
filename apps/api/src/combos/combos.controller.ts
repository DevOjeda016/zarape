import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators.js';
import { DeletionResult } from '../common/deletion.js';
import { CombosService } from './combos.service.js';
import { ComboDto, ComboQueryDto, CreateComboDto, UpdateComboDto } from './dto.js';

@ApiTags('combos')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('combos')
export class CombosController {
  constructor(private readonly combos: CombosService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar combos por nombre, alimentos o bebidas (RDF0604)' })
  @ApiOkResponse({ type: [ComboDto] })
  search(@Query() query: ComboQueryDto): Promise<ComboDto[]> {
    return this.combos.search(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: ComboDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ComboDto> {
    return this.combos.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar combo con alimentos y bebidas (RDF0601)' })
  @ApiOkResponse({ type: ComboDto })
  create(@Body() dto: CreateComboDto): Promise<ComboDto> {
    return this.combos.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar combo, todo excepto el ID (RDF0603)' })
  @ApiOkResponse({ type: ComboDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateComboDto): Promise<ComboDto> {
    return this.combos.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar combo: se borra o pasa a INACTIVE si ya se vendió (RDF0602)' })
  @ApiOkResponse({ type: DeletionResult })
  remove(@Param('id', ParseIntPipe) id: number): Promise<DeletionResult> {
    return this.combos.remove(id);
  }
}
