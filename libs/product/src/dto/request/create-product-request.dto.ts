import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductRequestDto {
  @ApiProperty({ example: '초코에몽 190ml * 10개', description: '제품 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '초코에몽 190ml 1 unit 단위', description: '제품 설명' })
  @IsString()
  @IsOptional()
  description?: string;
}
