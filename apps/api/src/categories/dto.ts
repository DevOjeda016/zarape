import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { StatusQuery, Trim } from '../common/query.js';
import { CategoryType, Status } from '../generated/prisma/enums.js';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Platillos' })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Escribe el nombre.' })
  @MaxLength(60)
  name: string;

  @ApiProperty({ enum: CategoryType, description: 'Si agrupa alimentos o bebidas.' })
  @IsEnum(CategoryType, { message: 'Elige si es de alimentos o de bebidas.' })
  type: CategoryType;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

export class CategoryQueryDto extends StatusQuery {
  @ApiPropertyOptional({ enum: CategoryType })
  @IsOptional()
  @Trim()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional()
  @IsOptional()
  @Trim()
  @IsString()
  name?: string;
}

export class CategoryDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty({ enum: CategoryType }) type: CategoryType;
  @ApiProperty({ enum: Status }) status: Status;
  @ApiProperty({ description: 'Alimentos o bebidas que la usan.' }) productCount: number;
}
