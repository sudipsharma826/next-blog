import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  Inject,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface HealthCheckOptions {
  checkPrisma?: boolean;
  checkRedis?: boolean;
}

@Injectable()
export class HealthCheckGuard implements CanActivate {
  constructor(
    @Inject(PrismaService) @Optional() private readonly prismaService?: PrismaService,
    @Inject(RedisService) @Optional() private readonly redisService?: RedisService,
    private readonly options: HealthCheckOptions = { checkPrisma: true, checkRedis: true },
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Prisma check
    if (this.options.checkPrisma && this.prismaService) {
      try {
        await this.prismaService.isHealthy();
      } catch {
        throw new ServiceUnavailableException('Database is not available');
      }
    }
    // Redis check
    if (this.options.checkRedis && this.redisService) {
      try {
        await this.redisService.isHealthy?.();
      } catch {
        throw new ServiceUnavailableException('Redis is not available');
      }
    }
    return true;
  }
}

// Factory function for custom options
export function createHealthCheckGuard(options: HealthCheckOptions) {
  @Injectable()
  class CustomHealthCheckGuard extends HealthCheckGuard {
    constructor(
      @Inject(PrismaService) @Optional() prisma?: PrismaService,
      @Inject(RedisService) @Optional() redisService?: RedisService,
    ) {
      super(prisma, redisService, options);
    }
  }
  return CustomHealthCheckGuard;
}
// Custom guards for specific routes
export const RedisOnlyGuard = createHealthCheckGuard({ checkPrisma: false, checkRedis: true });
export const RedisPrismaGuard = createHealthCheckGuard({ checkPrisma: true, checkRedis: true });
export const PrismaOnlyGuard = createHealthCheckGuard({ checkPrisma: true, checkRedis: false });
