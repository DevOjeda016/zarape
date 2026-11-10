import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decoradores.js';
import { ResultadoEliminacion } from '../comun/eliminacion.js';
import { CombosService } from './combos.service.js';
import { ActualizarComboDto, ComboDto, ConsultaCombosDto, CrearComboDto } from './dto.js';

@ApiTags('combos')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('combos')
export class CombosController {
  constructor(private readonly combos: CombosService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar combos por nombre, alimentos o bebidas (RDF0604)' })
  @ApiOkResponse({ type: [ComboDto] })
  buscar(@Query() consulta: ConsultaCombosDto): Promise<ComboDto[]> {
    return this.combos.buscar(consulta);
  }

  @Get(':id')
  @ApiOkResponse({ type: ComboDto })
  obtener(@Param('id', ParseIntPipe) id: number): Promise<ComboDto> {
    return this.combos.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar combo con alimentos y bebidas (RDF0601)' })
  @ApiOkResponse({ type: ComboDto })
  crear(@Body() dto: CrearComboDto): Promise<ComboDto> {
    return this.combos.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar combo, todo excepto el ID (RDF0603)' })
  @ApiOkResponse({ type: ComboDto })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarComboDto): Promise<ComboDto> {
    return this.combos.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar combo: se borra o pasa a BAJA si ya se vendió (RDF0602)' })
  @ApiOkResponse({ type: ResultadoEliminacion })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<ResultadoEliminacion> {
    return this.combos.eliminar(id);
  }
}
