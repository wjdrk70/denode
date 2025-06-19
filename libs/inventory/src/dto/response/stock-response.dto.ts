import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sku } from '@app/inventory/domain/sku';
import { ProductResponseDto } from '@app/product/dto/response/product-response.dto';

export class StockResponseDto {
  @ApiProperty({ example: 1, description: 'SKU ID' })
  id: number;

  @ApiProperty({ example: 1, description: '제품 ID' })
  productId: number;

  @ApiProperty({ example: 100, description: '현재 수량' })
  quantity: number;

  @ApiProperty({ example: '2025-12-31', description: '유통기한', required: false })
  expirationDate?: Date;

  @ApiPropertyOptional({ type: () => ProductResponseDto, description: '제품 정보' })
  product?: ProductResponseDto;

  constructor(sku: Sku) {
    this.id = sku.id;
    this.productId = sku.productId;
    this.quantity = sku.quantity;
    this.expirationDate = sku.expirationDate;
    if (sku.product) {
      this.product = new ProductResponseDto(sku.product);
    }
  }
}
