import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StockInDto {
  @ApiProperty({ example: 1, description: '제품 ID' })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 100, description: '입고 수량' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    example: '2025-12-31',
    description: '유통 기한 (선택)',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expirationDate?: Date;
}
