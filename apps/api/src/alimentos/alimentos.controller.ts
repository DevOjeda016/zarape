import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decoradores.js';
import { ResultadoEliminacion } from '../comun/eliminacion.js';
import { ActualizarProductoDto, ConsultaProductosDto, CrearProductoDto, ProductoDto } from '../comun/producto.dto.js';
import { AlimentosService } from './alimentos.service.js';

@ApiTags('alimentos')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('alimentos')
export class AlimentosController {
  constructor(private readonly alimentos: AlimentosService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar alimentos por nombre, precio o categoría (RDF0404)' })
  @ApiOkResponse({ type: [ProductoDto] })
  buscar(@Query() consulta: ConsultaProductosDto): Promise<ProductoDto[]> {
    return this.alimentos.buscar(consulta);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductoDto })
  obtener(@Param('id', ParseIntPipe) id: number): Promise<ProductoDto> {
    return this.alimentos.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar alimento (RDF0401)' })
  @ApiOkResponse({ type: ProductoDto })
  crear(@Body() dto: CrearProductoDto): Promise<ProductoDto> {
    return this.alimentos.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar alimento, todo excepto el ID (RDF0403)' })
  @ApiOkResponse({ type: ProductoDto })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarProductoDto): Promise<ProductoDto> {
    return this.alimentos.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar alimento: se borra o pasa a BAJA si tiene relacionados (RDF0402)' })
  @ApiOkResponse({ type: ResultadoEliminacion })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<ResultadoEliminacion> {
    return this.alimentos.eliminar(id);
  }
}
