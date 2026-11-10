import { Injectable, NotFoundException } from '@nestjs/common';
import { toNumber } from '../common/decimals.js';
import { deleteOrDeactivate, type DeletionResult } from '../common/deletion.js';
import { containsText } from '../common/query.js';
import type { Branch } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { BranchDto, BranchQueryDto, CreateBranchDto, UpdateBranchDto } from './dto.js';

function toDto(branch: Branch): BranchDto {
  return { ...branch, latitude: toNumber(branch.latitude), longitude: toNumber(branch.longitude) };
}

/** RF02: catálogo de sucursales. */
@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: BranchQueryDto): Promise<BranchDto[]> {
    const branches = await this.prisma.branch.findMany({
      where: { name: containsText(query.name), address: containsText(query.location), status: query.status },
      orderBy: { name: 'asc' },
    });
    return branches.map(toDto);
  }

  async findOne(id: number): Promise<BranchDto> {
    return toDto(await this.existing(id));
  }

  async create(dto: CreateBranchDto): Promise<BranchDto> {
    return toDto(await this.prisma.branch.create({ data: dto }));
  }

  async update(id: number, dto: UpdateBranchDto): Promise<BranchDto> {
    await this.existing(id);
    return toDto(await this.prisma.branch.update({ where: { id }, data: dto }));
  }

  /** Relacionados: empleados asignados, comandas y gastos de mercadeo. */
  async remove(id: number): Promise<DeletionResult> {
    const branch = await this.existing(id);
    const { _count } = await this.prisma.branch.findUniqueOrThrow({
      where: { id },
      select: { _count: { select: { employees: true, orders: true, marketingExpenses: true } } },
    });
    return deleteOrDeactivate(
      _count.employees + _count.orders + _count.marketingExpenses,
      `La sucursal ${branch.name}`,
      () => this.prisma.branch.delete({ where: { id } }),
      () => this.prisma.branch.update({ where: { id }, data: { status: 'INACTIVE' } }),
    );
  }

  private async existing(id: number): Promise<Branch> {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('No encontramos esa sucursal.');
    return branch;
  }
}
