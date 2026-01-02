import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RedisModule } from '../redis/redis.module';
import { JwtModule } from '../jwt/jwt.module';
import { EmailModule } from '../email/email.module';
import { PassportModule } from '@nestjs/passport';
import { AuthStrategiesModule } from './auth.strategies.module';

@Module({
  imports: [RedisModule, JwtModule, EmailModule, PassportModule, AuthStrategiesModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
