import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { generatePassword } from '../auth/password.js';
import { deleteOrDeactivate, type DeletionResult } from '../common/deletion.js';
import { containsText } from '../common/query.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateEmployeeDto,
  EmployeeDto,
  EmployeeQueryDto,
  EmployeeWithPasswordDto,
  UpdateEmployeeDto,
} from './dto.js';

/** Nunca se selecciona el hash: no sale de este servicio. */
const EMPLOYEE_SELECT = {
  id: true,
  username: true,
  role: true,
  branchId: true,
  status: true,
  branch: { select: { id: true, name: true } },
} as const;

export const BCRYPT_ROUNDS = 10;

/** RF03: empleados (administración y cocina). */
@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  search(query: EmployeeQueryDto): Promise<EmployeeDto[]> {
    return this.prisma.employee.findMany({
      where: { username: containsText(query.username), status: query.status },
      select: EMPLOYEE_SELECT,
      orderBy: { username: 'asc' },
    });
  }

  async findOne(id: number): Promise<EmployeeDto> {
    const employee = await this.prisma.employee.findUnique({ where: { id }, select: EMPLOYEE_SELECT });
    if (!employee) throw new NotFoundException('No encontramos ese usuario.');
    return employee;
  }

  async create(dto: CreateEmployeeDto): Promise<EmployeeWithPasswordDto> {
    await this.ensureUsernameFree(dto.username);
    await this.ensureBranch(dto.branchId);
    const password = generatePassword();
    const employee = await this.prisma.employee.create({
      data: {
        username: dto.username,
        role: dto.role,
        branchId: dto.branchId ?? null,
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      },
      select: EMPLOYEE_SELECT,
    });
    return { ...employee, password };
  }

  async update(id: number, dto: UpdateEmployeeDto, sessionId: number): Promise<EmployeeDto> {
    const current = await this.findOne(id);
    if (id === sessionId && ((dto.status && dto.status !== 'ACTIVE') || (dto.role && dto.role !== current.role))) {
      throw new BadRequestException('No puedes darte de baja ni cambiar tu propio rol.');
    }
    if (dto.username && dto.username !== current.username) await this.ensureUsernameFree(dto.username);
    await this.ensureBranch(dto.branchId);
    return this.prisma.employee.update({ where: { id }, data: dto, select: EMPLOYEE_SELECT });
  }

  /** Genera una contraseña nueva (la anterior deja de servir) y la regresa una sola vez. */
  async resetPassword(id: number): Promise<EmployeeWithPasswordDto> {
    await this.findOne(id);
    const password = generatePassword();
    const employee = await this.prisma.employee.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) },
      select: EMPLOYEE_SELECT,
    });
    return { ...employee, password };
  }

  /**
   * Hoy ninguna tabla apunta a un empleado, así que se borra. Si más adelante se registra
   * quién atendió una comanda, se cuentan esos registros aquí y aplica la baja.
   */
  async remove(id: number, sessionId: number): Promise<DeletionResult> {
    if (id === sessionId) throw new BadRequestException('No puedes eliminar tu propio usuario.');
    const employee = await this.findOne(id);
    return deleteOrDeactivate(
      0,
      `El usuario ${employee.username}`,
      () => this.prisma.employee.delete({ where: { id } }),
      () => this.prisma.employee.update({ where: { id }, data: { status: 'INACTIVE' } }),
    );
  }

  private async ensureUsernameFree(username: string): Promise<void> {
    const exists = await this.prisma.employee.findUnique({ where: { username }, select: { id: true } });
    if (exists) throw new ConflictException(`El usuario ${username} ya existe. Elige otro nombre.`);
  }

  private async ensureBranch(branchId: number | null | undefined): Promise<void> {
    if (branchId == null) return;
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId }, select: { status: true } });
    if (!branch) throw new BadRequestException('Esa sucursal no existe.');
    if (branch.status !== 'ACTIVE') throw new BadRequestException('Esa sucursal está dada de baja.');
  }
}
