import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';

/** Empleados: CRUD y contraseña aleatoria de 12 caracteres (RF03). */
@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
