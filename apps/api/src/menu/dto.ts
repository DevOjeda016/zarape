import { ApiProperty } from '@nestjs/swagger';
import { CategorySummaryDto } from '../common/product.dto.js';

export class MenuProductDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty() photoUrl: string;
  @ApiProperty({ description: 'MXN con IVA incluido.' }) price: number;
  @ApiProperty({ type: CategorySummaryDto }) category: CategorySummaryDto;
}

export class MenuComboPartDto {
  @ApiProperty() name: string;
  @ApiProperty() quantity: number;
}

export class MenuComboDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty() photoUrl: string;
  @ApiProperty({ description: 'MXN con IVA incluido.' }) price: number;
  @ApiProperty({ type: [MenuComboPartDto], description: 'Alimentos y bebidas que incluye.' }) contents: MenuComboPartDto[];
}

export class MenuDto {
  @ApiProperty({ type: [MenuProductDto] }) foods: MenuProductDto[];
  @ApiProperty({ type: [MenuProductDto] }) drinks: MenuProductDto[];
  @ApiProperty({ type: [MenuComboDto] }) combos: MenuComboDto[];
}

export class MenuBranchDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() address: string;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiProperty() photoUrl: string;
  @ApiProperty() url: string;
  @ApiProperty() hours: string;
}
