import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators.js';
import { MenuBranchDto, MenuDto } from './dto.js';
import { MenuService } from './menu.service.js';

/** Lo que ve el comensal sin iniciar sesión (RF07, RF08, RF19): solo registros activos. */
@ApiTags('menu')
@Public()
@Controller('menu')
export class MenuController {
  constructor(private readonly menu: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Menú activo: alimentos, bebidas y combos (RF07, RF19)' })
  @ApiOkResponse({ type: MenuDto })
  find(): Promise<MenuDto> {
    return this.menu.find();
  }

  @Get('branches')
  @ApiOperation({ summary: 'Sucursales activas, para elegir dónde ordenar (RF19)' })
  @ApiOkResponse({ type: [MenuBranchDto] })
  branches(): Promise<MenuBranchDto[]> {
    return this.menu.branches();
  }
}
