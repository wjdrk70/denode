import { ApiProperty } from '@nestjs/swagger';
import { Product } from '@app/product/domain/product';

export class ProductResponseDto {
  @ApiProperty({ example: 1, description: '제품 ID' })
  id: number;

  @ApiProperty({ example: '초코에몽 190ml * 10', description: '제품 이름' })
  name: string;

  @ApiProperty({ example: '초코에몽 190ml unit 1', description: '제품 설명' })
  description: string;

  constructor(product: Product) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description;
  }
}
