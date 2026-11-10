import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decoradores.js';
import { ResultadoEliminacion } from '../comun/eliminacion.js';
import { ActualizarProductoDto, ConsultaProductosDto, CrearProductoDto, ProductoDto } from '../comun/producto.dto.js';
import { BebidasService } from './bebidas.service.js';

@ApiTags('bebidas')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('bebidas')
export class BebidasController {
  constructor(private readonly bebidas: BebidasService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar bebidas por nombre, precio o categoría (RDF0504)' })
  @ApiOkResponse({ type: [ProductoDto] })
  buscar(@Query() consulta: ConsultaProductosDto): Promise<ProductoDto[]> {
    return this.bebidas.buscar(consulta);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductoDto })
  obtener(@Param('id', ParseIntPipe) id: number): Promise<ProductoDto> {
    return this.bebidas.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar bebida (RDF0501)' })
  @ApiOkResponse({ type: ProductoDto })
  crear(@Body() dto: CrearProductoDto): Promise<ProductoDto> {
    return this.bebidas.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar bebida, todo excepto el ID (RDF0503)' })
  @ApiOkResponse({ type: ProductoDto })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarProductoDto): Promise<ProductoDto> {
    return this.bebidas.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar bebida: se borra o pasa a BAJA si tiene relacionados (RDF0502)' })
  @ApiOkResponse({ type: ResultadoEliminacion })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<ResultadoEliminacion> {
    return this.bebidas.eliminar(id);
  }
}
