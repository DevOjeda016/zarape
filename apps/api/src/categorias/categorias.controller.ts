import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decoradores.js';
import { ResultadoEliminacion } from '../comun/eliminacion.js';
import { CategoriasService } from './categorias.service.js';
import { ActualizarCategoriaDto, CategoriaDto, ConsultaCategoriasDto, CrearCategoriaDto } from './dto.js';

@ApiTags('categorias')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categorias: CategoriasService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar categorías por tipo o nombre' })
  @ApiOkResponse({ type: [CategoriaDto] })
  buscar(@Query() consulta: ConsultaCategoriasDto): Promise<CategoriaDto[]> {
    return this.categorias.buscar(consulta);
  }

  @Get(':id')
  @ApiOkResponse({ type: CategoriaDto })
  obtener(@Param('id', ParseIntPipe) id: number): Promise<CategoriaDto> {
    return this.categorias.obtener(id);
  }

  @Post()
  @ApiOkResponse({ type: CategoriaDto })
  crear(@Body() dto: CrearCategoriaDto): Promise<CategoriaDto> {
    return this.categorias.crear(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CategoriaDto })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarCategoriaDto): Promise<CategoriaDto> {
    return this.categorias.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoría: se borra o pasa a BAJA si tiene productos' })
  @ApiOkResponse({ type: ResultadoEliminacion })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<ResultadoEliminacion> {
    return this.categorias.eliminar(id);
  }
}
