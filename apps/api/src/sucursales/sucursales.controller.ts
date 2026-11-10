import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decoradores.js';
import { ResultadoEliminacion } from '../comun/eliminacion.js';
import { ActualizarSucursalDto, ConsultaSucursalesDto, CrearSucursalDto, SucursalDto } from './dto.js';
import { SucursalesService } from './sucursales.service.js';

@ApiTags('sucursales')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('sucursales')
export class SucursalesController {
  constructor(private readonly sucursales: SucursalesService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar sucursales por nombre o ubicación (RDF0204)' })
  @ApiOkResponse({ type: [SucursalDto] })
  buscar(@Query() consulta: ConsultaSucursalesDto): Promise<SucursalDto[]> {
    return this.sucursales.buscar(consulta);
  }

  @Get(':id')
  @ApiOkResponse({ type: SucursalDto })
  obtener(@Param('id', ParseIntPipe) id: number): Promise<SucursalDto> {
    return this.sucursales.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar sucursal (RDF0201)' })
  @ApiOkResponse({ type: SucursalDto })
  crear(@Body() dto: CrearSucursalDto): Promise<SucursalDto> {
    return this.sucursales.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar sucursal, todo excepto el ID (RDF0203)' })
  @ApiOkResponse({ type: SucursalDto })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarSucursalDto): Promise<SucursalDto> {
    return this.sucursales.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar sucursal: se borra o pasa a BAJA si tiene relacionados (RDF0202)' })
  @ApiOkResponse({ type: ResultadoEliminacion })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<ResultadoEliminacion> {
    return this.sucursales.eliminar(id);
  }
}
