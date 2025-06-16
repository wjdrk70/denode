import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from '@api/catalog/dto/create-product.dto';
import { Product } from '@app/domain/catalog/product';
import { PRODUCT_REPOSITORY, ProductRepository } from '@app/domain/catalog/product.repository';

@Injectable()
export class ProductService {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const existProduct = await this.productRepository.findByName(dto.name);
    if (existProduct) {
      throw new ConflictException('이미 존재하는 제품 이름입니다.');
    }
    const product = Product.create({ name: dto.name, description: dto.description });

    return this.productRepository.save(product);
  }
}
