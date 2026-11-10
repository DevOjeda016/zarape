import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators.js';
import { DeletionResult } from '../common/deletion.js';
import { CategoriesService } from './categories.service.js';
import { CategoryDto, CategoryQueryDto, CreateCategoryDto, UpdateCategoryDto } from './dto.js';

@ApiTags('categories')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar categorías por tipo o nombre' })
  @ApiOkResponse({ type: [CategoryDto] })
  search(@Query() query: CategoryQueryDto): Promise<CategoryDto[]> {
    return this.categories.search(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: CategoryDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CategoryDto> {
    return this.categories.findOne(id);
  }

  @Post()
  @ApiOkResponse({ type: CategoryDto })
  create(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categories.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CategoryDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto): Promise<CategoryDto> {
    return this.categories.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoría: se borra o pasa a INACTIVE si tiene productos' })
  @ApiOkResponse({ type: DeletionResult })
  remove(@Param('id', ParseIntPipe) id: number): Promise<DeletionResult> {
    return this.categories.remove(id);
  }
}
