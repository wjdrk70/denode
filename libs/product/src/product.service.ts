import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PRODUCT_REPOSITORY, ProductRepository } from './domain/product.repository';
import { Product } from './domain/product';
import { ProductNotFoundException } from '@app/product/support/exception/product-not-found.exception';

@Injectable()
export class ProductService {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const existProduct = await this.productRepository.findByName(dto.name);
    if (existProduct) {
      throw new ProductNotFoundException();
    }
    const product = Product.create({ name: dto.name, description: dto.description });

    return this.productRepository.save(product);
  }
}
