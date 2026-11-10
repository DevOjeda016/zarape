import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators.js';
import { DeletionResult } from '../common/deletion.js';
import { CreateProductDto, ProductDto, ProductQueryDto, UpdateProductDto } from '../common/product.dto.js';
import { DrinksService } from './drinks.service.js';

@ApiTags('drinks')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('drinks')
export class DrinksController {
  constructor(private readonly drinks: DrinksService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar bebidas por nombre, precio o categoría (RDF0504)' })
  @ApiOkResponse({ type: [ProductDto] })
  search(@Query() query: ProductQueryDto): Promise<ProductDto[]> {
    return this.drinks.search(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductDto> {
    return this.drinks.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar bebida (RDF0501)' })
  @ApiOkResponse({ type: ProductDto })
  create(@Body() dto: CreateProductDto): Promise<ProductDto> {
    return this.drinks.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar bebida, todo excepto el ID (RDF0503)' })
  @ApiOkResponse({ type: ProductDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto): Promise<ProductDto> {
    return this.drinks.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar bebida: se borra o pasa a INACTIVE si tiene relacionados (RDF0502)' })
  @ApiOkResponse({ type: DeletionResult })
  remove(@Param('id', ParseIntPipe) id: number): Promise<DeletionResult> {
    return this.drinks.remove(id);
  }
}
