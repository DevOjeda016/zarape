import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, SesionActual } from '../auth/decoradores.js';
import type { SesionEmpleado } from '../auth/sesion.js';
import { ResultadoEliminacion } from '../comun/eliminacion.js';
import {
  ActualizarUsuarioDto,
  ConsultaUsuariosDto,
  CrearUsuarioDto,
  UsuarioConContrasenaDto,
  UsuarioDto,
} from './dto.js';
import { UsuariosService } from './usuarios.service.js';

@ApiTags('usuarios')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar usuarios por nombre de usuario (RDF0304)' })
  @ApiOkResponse({ type: [UsuarioDto] })
  buscar(@Query() consulta: ConsultaUsuariosDto): Promise<UsuarioDto[]> {
    return this.usuarios.buscar(consulta);
  }

  @Get(':id')
  @ApiOkResponse({ type: UsuarioDto })
  obtener(@Param('id', ParseIntPipe) id: number): Promise<UsuarioDto> {
    return this.usuarios.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar usuario con contraseña aleatoria de 12 caracteres (RDF0301)' })
  @ApiOkResponse({ type: UsuarioConContrasenaDto })
  crear(@Body() dto: CrearUsuarioDto): Promise<UsuarioConContrasenaDto> {
    return this.usuarios.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar usuario, todo excepto el ID (RDF0303)' })
  @ApiOkResponse({ type: UsuarioDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
    @SesionActual() sesion: SesionEmpleado,
  ): Promise<UsuarioDto> {
    return this.usuarios.actualizar(id, dto, sesion.sub);
  }

  @Post(':id/contrasena')
  @ApiOperation({ summary: 'Generar una contraseña nueva de 12 caracteres' })
  @ApiOkResponse({ type: UsuarioConContrasenaDto })
  regenerarContrasena(@Param('id', ParseIntPipe) id: number): Promise<UsuarioConContrasenaDto> {
    return this.usuarios.regenerarContrasena(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario: se borra o pasa a BAJA si tiene relacionados (RDF0302)' })
  @ApiOkResponse({ type: ResultadoEliminacion })
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @SesionActual() sesion: SesionEmpleado,
  ): Promise<ResultadoEliminacion> {
    return this.usuarios.eliminar(id, sesion.sub);
  }
}
