import 'dotenv/config';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {
    const accelerateUrl = configService.get<string>('ACCELERATE_URL') ?? '';
    super({
      accelerateUrl,
    });
    this.configService = configService;
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.error('❌ Prisma connection failed:', err);
      throw new ServiceUnavailableException('Service Not Available');
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (err) {
      console.error('❌ Prisma disconnect failed:', err);
    }
  }
  // health check method
  async isHealthy(): Promise<void> {
    try {
      // Simple query to check database connectivity
      await this.$queryRaw`SELECT 1`;
    } catch (err) {
      console.error('❌ Prisma health check failed:', err);
      throw new ServiceUnavailableException('Service Not Available');
    }
  }
}
