import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ItemModule } from './item/item.module';

@Module({
  imports: [AuthModule, UserModule, ItemModule],
})
export class AppModule {}
