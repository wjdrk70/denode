import { Module } from '@nestjs/common';
import { UserModule } from '@app/user';
import { AuthService } from '@app/auth/auth.service';
import { StorageModule } from '@app/storage';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@app/auth/jwt.strategy';

@Module({
  imports: [
    UserModule,
    StorageModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [PassportModule, JwtStrategy, AuthService],
})
export class AuthModule {}
