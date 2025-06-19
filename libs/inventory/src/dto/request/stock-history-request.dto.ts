import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StockHistoryRequestDto {
  @ApiPropertyOptional({ description: '특정 유통기한 필터링 (YYYY-MM-DD) null 허용', required: false })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expirationDate?: Date;

  @ApiPropertyOptional({ description: '오프셋', default: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset: number = 0;

  @ApiPropertyOptional({ description: '리미트', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 10;
}
