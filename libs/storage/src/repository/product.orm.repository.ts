import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@app/product/domain/product';
import { ProductRepository } from '@app/product/domain/product.repository';
import { ProductEntity } from '@app/storage/entity/product.entity';
import { ProductMapper } from '@app/storage/mapper/product.mapper';

@Injectable()
export class ProductOrmRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findById(productId: number): Promise<Product | null> {
    const entity = await this.repository.findOneBy({ id: productId });
    return entity ? ProductMapper.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Product | null> {
    const entity = await this.repository.findOneBy({ name });
    return entity ? ProductMapper.toDomain(entity) : null;
  }

  async save(product: Product): Promise<Product> {
    const entity = ProductMapper.toEntity(product);
    const saveEntity = await this.repository.save(entity);

    return ProductMapper.toDomain(saveEntity);
  }
}
