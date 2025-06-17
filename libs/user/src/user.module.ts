import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { StorageModule } from '@app/storage';

@Module({
  imports: [StorageModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
