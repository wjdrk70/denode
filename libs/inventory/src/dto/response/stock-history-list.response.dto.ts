import { ApiProperty } from '@nestjs/swagger';
import { StockHistoryItemDto } from '@app/inventory/dto/response/stock-history-item.dto';
import { StockHistory } from '@app/inventory/domain/stock-history';

export class StockHistoryListResponseDto {
  @ApiProperty({ type: [StockHistoryItemDto], description: '입출고 히스토리 목록' })
  items: StockHistoryItemDto[];

  @ApiProperty({ example: 42, description: '해당 SKU의 전체 히스토리 개수' })
  total: number;

  constructor(histories: StockHistory[], total: number) {
    this.items = histories.map((history) => new StockHistoryItemDto(history));
    this.total = total;
  }
}
