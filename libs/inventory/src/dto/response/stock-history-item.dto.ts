import { ApiProperty } from '@nestjs/swagger';
import { StockHistoryType } from '@app/inventory/domain/stock-history.type';
import { StockHistory } from '@app/inventory/domain/stock-history';

export class StockHistoryItemDto {
  @ApiProperty({ example: 1, description: '히스토리 ID' })
  id: number;

  @ApiProperty({ example: 1, description: '처리한 사용자 ID' })
  userId: number;

  @ApiProperty({ example: 'INBOUND', description: '히스토리 종류 (INBOUND or OUTBOUND)', enum: StockHistoryType })
  type: StockHistoryType;

  @ApiProperty({ example: 50, description: '처리된 수량' })
  quantity: number;

  @ApiProperty({ example: '2025-06-20T10:00:00.000Z', description: '처리 일시' })
  createdAt: Date;

  constructor(history: StockHistory) {
    this.id = history.id;
    this.userId = history.userId;
    this.type = history.type;
    this.quantity = history.quantity;
    this.createdAt = history.createdAt;
  }
}
