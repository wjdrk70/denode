import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@app/catalog/domain/product';
import { ProductRepository } from '@app/catalog/domain/product.repository';
import { ProductEntity } from '@app/storage/entities/product.entity';
import { ProductMapper } from '@app/storage/mappers/product.mapper';

@Injectable()
export class ProductOrmRepository implements ProductRepository {
  constructor(@InjectRepository(ProductEntity) private readonly repository: Repository<ProductEntity>) {}

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
