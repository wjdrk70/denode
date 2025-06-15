import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@app/storage/entities/base.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;
}
