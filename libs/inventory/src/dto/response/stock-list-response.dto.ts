import { ApiProperty } from '@nestjs/swagger';
import { StockResponseDto } from '@app/inventory/dto/response/stock-response.dto';
import { Sku } from '@app/inventory/domain/sku';

export class StockListResponseDto {
  @ApiProperty({ type: [StockResponseDto], description: '재고(SKU) 목록' })
  items: StockResponseDto[];

  @ApiProperty({ example: 123, description: '전체 재고(SKU) 종류 수' })
  total: number;

  constructor(skus: Sku[], total: number) {
    this.items = skus.map((sku) => new StockResponseDto(sku));
    this.total = total;
  }
}
