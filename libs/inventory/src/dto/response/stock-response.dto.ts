import { ApiProperty } from '@nestjs/swagger';
import { Sku } from '@app/inventory/domain/sku';

export class StockResponseDto {
  @ApiProperty({ example: 1, description: 'SKU ID' })
  id: number;

  @ApiProperty({ example: 1, description: '제품 ID' })
  productId: number;

  @ApiProperty({ example: 100, description: '현재 수량' })
  quantity: number;

  @ApiProperty({ example: '2025-12-31', description: '유통기한', required: false })
  expirationDate?: Date;

  constructor(sku: Sku) {
    this.id = sku.id;
    this.productId = sku.productId;
    this.quantity = sku.quantity;
    this.expirationDate = sku.expirationDate;
  }
}
