import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JwtService } from './jwt.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    RedisModule,
    ConfigModule,
    NestJwtModule.registerAsync({ // using registerAsync to inject ConfigService we donnt need to explicitly set secrets any in token genrate and verification , JWT Module auto set the secret from env
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
      }),
    }),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
