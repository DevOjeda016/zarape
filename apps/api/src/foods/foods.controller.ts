import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators.js';
import { DeletionResult } from '../common/deletion.js';
import { CreateProductDto, ProductDto, ProductQueryDto, UpdateProductDto } from '../common/product.dto.js';
import { FoodsService } from './foods.service.js';

@ApiTags('foods')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('foods')
export class FoodsController {
  constructor(private readonly foods: FoodsService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar alimentos por nombre, precio o categoría (RDF0404)' })
  @ApiOkResponse({ type: [ProductDto] })
  search(@Query() query: ProductQueryDto): Promise<ProductDto[]> {
    return this.foods.search(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductDto> {
    return this.foods.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar alimento (RDF0401)' })
  @ApiOkResponse({ type: ProductDto })
  create(@Body() dto: CreateProductDto): Promise<ProductDto> {
    return this.foods.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar alimento, todo excepto el ID (RDF0403)' })
  @ApiOkResponse({ type: ProductDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto): Promise<ProductDto> {
    return this.foods.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar alimento: se borra o pasa a INACTIVE si tiene relacionados (RDF0402)' })
  @ApiOkResponse({ type: DeletionResult })
  remove(@Param('id', ParseIntPipe) id: number): Promise<DeletionResult> {
    return this.foods.remove(id);
  }
}
