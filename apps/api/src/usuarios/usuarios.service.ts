import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { generarContrasena } from '../auth/contrasena.js';
import { contiene } from '../comun/consulta.js';
import { eliminarOBaja, type ResultadoEliminacion } from '../comun/eliminacion.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  ActualizarUsuarioDto,
  ConsultaUsuariosDto,
  CrearUsuarioDto,
  UsuarioConContrasenaDto,
  UsuarioDto,
} from './dto.js';

/** Nunca se selecciona el hash: no sale de este servicio. */
const CAMPOS = {
  id: true,
  nombreUsuario: true,
  rol: true,
  sucursalId: true,
  estatus: true,
  sucursal: { select: { id: true, nombre: true } },
} as const;

export const RONDAS_BCRYPT = 10;

/** RF03: empleados (administrador y cocina). */
@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  buscar(consulta: ConsultaUsuariosDto): Promise<UsuarioDto[]> {
    return this.prisma.usuario.findMany({
      where: { nombreUsuario: contiene(consulta.nombreUsuario), estatus: consulta.estatus },
      select: CAMPOS,
      orderBy: { nombreUsuario: 'asc' },
    });
  }

  async obtener(id: number): Promise<UsuarioDto> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id }, select: CAMPOS });
    if (!usuario) throw new NotFoundException('No encontramos ese usuario.');
    return usuario;
  }

  async crear(dto: CrearUsuarioDto): Promise<UsuarioConContrasenaDto> {
    await this.revisarNombreLibre(dto.nombreUsuario);
    await this.revisarSucursal(dto.sucursalId);
    const contrasena = generarContrasena();
    const usuario = await this.prisma.usuario.create({
      data: {
        nombreUsuario: dto.nombreUsuario,
        rol: dto.rol,
        sucursalId: dto.sucursalId ?? null,
        passwordHash: await bcrypt.hash(contrasena, RONDAS_BCRYPT),
      },
      select: CAMPOS,
    });
    return { ...usuario, contrasena };
  }

  async actualizar(id: number, dto: ActualizarUsuarioDto, idSesion: number): Promise<UsuarioDto> {
    const actual = await this.obtener(id);
    if (id === idSesion && ((dto.estatus && dto.estatus !== 'ACTIVO') || (dto.rol && dto.rol !== actual.rol))) {
      throw new BadRequestException('No puedes darte de baja ni cambiar tu propio rol.');
    }
    if (dto.nombreUsuario && dto.nombreUsuario !== actual.nombreUsuario) {
      await this.revisarNombreLibre(dto.nombreUsuario);
    }
    await this.revisarSucursal(dto.sucursalId);
    return this.prisma.usuario.update({ where: { id }, data: dto, select: CAMPOS });
  }

  /** Genera una contraseña nueva (la anterior deja de servir) y la regresa una sola vez. */
  async regenerarContrasena(id: number): Promise<UsuarioConContrasenaDto> {
    await this.obtener(id);
    const contrasena = generarContrasena();
    const usuario = await this.prisma.usuario.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(contrasena, RONDAS_BCRYPT) },
      select: CAMPOS,
    });
    return { ...usuario, contrasena };
  }

  /**
   * Hoy ninguna tabla apunta a un empleado, así que se borra. Si más adelante se registra
   * quién atendió una comanda, se cuentan esos registros aquí y aplica la BAJA.
   */
  async eliminar(id: number, idSesion: number): Promise<ResultadoEliminacion> {
    if (id === idSesion) throw new BadRequestException('No puedes eliminar tu propio usuario.');
    const usuario = await this.obtener(id);
    return eliminarOBaja(
      0,
      `El usuario ${usuario.nombreUsuario}`,
      () => this.prisma.usuario.delete({ where: { id } }),
      () => this.prisma.usuario.update({ where: { id }, data: { estatus: 'BAJA' } }),
    );
  }

  private async revisarNombreLibre(nombreUsuario: string): Promise<void> {
    const existe = await this.prisma.usuario.findUnique({ where: { nombreUsuario }, select: { id: true } });
    if (existe) throw new ConflictException(`El usuario ${nombreUsuario} ya existe. Elige otro nombre.`);
  }

  private async revisarSucursal(sucursalId: number | null | undefined): Promise<void> {
    if (sucursalId == null) return;
    const sucursal = await this.prisma.sucursal.findUnique({ where: { id: sucursalId }, select: { estatus: true } });
    if (!sucursal) throw new BadRequestException('Esa sucursal no existe.');
    if (sucursal.estatus !== 'ACTIVO') throw new BadRequestException('Esa sucursal está dada de baja.');
  }
}
