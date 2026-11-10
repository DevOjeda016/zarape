import { Injectable, NotFoundException } from '@nestjs/common';
import { aNumero } from '../comun/decimales.js';
import { contiene } from '../comun/consulta.js';
import { eliminarOBaja, type ResultadoEliminacion } from '../comun/eliminacion.js';
import type { Sucursal } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ActualizarSucursalDto, ConsultaSucursalesDto, CrearSucursalDto, SucursalDto } from './dto.js';

function aDto(sucursal: Sucursal): SucursalDto {
  return { ...sucursal, latitud: aNumero(sucursal.latitud), longitud: aNumero(sucursal.longitud) };
}

/** RF02: catálogo de sucursales. */
@Injectable()
export class SucursalesService {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(consulta: ConsultaSucursalesDto): Promise<SucursalDto[]> {
    const sucursales = await this.prisma.sucursal.findMany({
      where: {
        nombre: contiene(consulta.nombre),
        direccion: contiene(consulta.ubicacion),
        estatus: consulta.estatus,
      },
      orderBy: { nombre: 'asc' },
    });
    return sucursales.map(aDto);
  }

  async obtener(id: number): Promise<SucursalDto> {
    return aDto(await this.existente(id));
  }

  async crear(dto: CrearSucursalDto): Promise<SucursalDto> {
    return aDto(await this.prisma.sucursal.create({ data: dto }));
  }

  async actualizar(id: number, dto: ActualizarSucursalDto): Promise<SucursalDto> {
    await this.existente(id);
    return aDto(await this.prisma.sucursal.update({ where: { id }, data: dto }));
  }

  /** Relacionados: empleados asignados, comandas y gastos de mercadeo. */
  async eliminar(id: number): Promise<ResultadoEliminacion> {
    const sucursal = await this.existente(id);
    const { _count } = await this.prisma.sucursal.findUniqueOrThrow({
      where: { id },
      select: { _count: { select: { usuarios: true, comandas: true, gastosMarketing: true } } },
    });
    return eliminarOBaja(
      _count.usuarios + _count.comandas + _count.gastosMarketing,
      `La sucursal ${sucursal.nombre}`,
      () => this.prisma.sucursal.delete({ where: { id } }),
      () => this.prisma.sucursal.update({ where: { id }, data: { estatus: 'BAJA' } }),
    );
  }

  private async existente(id: number): Promise<Sucursal> {
    const sucursal = await this.prisma.sucursal.findUnique({ where: { id } });
    if (!sucursal) throw new NotFoundException('No encontramos esa sucursal.');
    return sucursal;
  }
}
