import { ApiProperty } from '@nestjs/swagger';

export class OutboundResponseDto {
  @ApiProperty({ example: 1, description: '출고 처리된 제품 ID' })
  productId: number;

  @ApiProperty({ example: 42, description: '해당 제품의 출고 후 남은 총 재고량' })
  totalRemainingQuantity: number;

  constructor(productId: number, totalRemainingQuantity: number) {
    this.productId = productId;
    this.totalRemainingQuantity = totalRemainingQuantity;
  }
}
