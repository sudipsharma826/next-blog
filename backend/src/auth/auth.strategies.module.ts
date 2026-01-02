import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';

@Module({
  imports: [PassportModule],
  providers: [GoogleStrategy, GithubStrategy],
  exports: [PassportModule],
})
export class AuthStrategiesModule {}
