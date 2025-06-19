import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class OutboundRequestDto {
  @ApiProperty({ example: 1, description: '제품 ID' })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 50, description: '출고할 수량' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}