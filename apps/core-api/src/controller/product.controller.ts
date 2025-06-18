import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProductDto } from '@app/product/dto/create-product.dto';
import { ProductService } from '@app/product';
import { Product } from '@app/product/domain/product';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '제품 등록', description: '새로운 제품을 등록합니다.' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: '제품 등록 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 409, description: '이미 존재하는 제품 이름' })
  async createProduct(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productService.createProduct(dto);
  }
}
