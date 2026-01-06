/**
 * RedisService
 *
 * Use Case:
 * 1. Store user global token version for quick access and validation.
 *    Key format: `user:{userId}:gtv`
 * 2. Can be extended to store any cache or session data.
 */

import {
  Injectable,
  ServiceUnavailableException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  private readonly redis: Redis;

  constructor(private readonly config: ConfigService) {
    const redisUrl = this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';

    // Single Redis connection; ioredis handles auto-reconnection
    this.redis = new Redis(redisUrl);

    // Redis connection events for debugging/monitoring
    this.redis.on('connect', () => console.log('[Redis] Connecting...'));
    this.redis.on('ready', () => console.log('[Redis] Ready'));
    this.redis.on('error', (err) => console.error('[Redis] Error:', err));
    this.redis.on('close', () => console.log('[Redis] Connection closed'));
    this.redis.on('reconnecting', (delay: number) =>
      console.log(`[Redis] Reconnecting in ${delay}ms`),
    );
    this.redis.on('end', () => console.log('[Redis] Connection ended'));
  }

  // Optional: check Redis connection status
  private ensureReady() {
    if (this.redis.status !== 'ready') {
      console.log('[Redis] Redis is not ready');
      throw new ServiceUnavailableException('Service Not Available');
    }
  }

  // Get value by key
  async get(key: string): Promise<string | null> {
    this.ensureReady();
    return this.redis.get(key);
  }

  // Set value with optional TTL in seconds
  async set(key: string, value: string, expireTimeSeconds?: number): Promise<void> {
    this.ensureReady();
    if (expireTimeSeconds) {
      await this.redis.set(key, value, 'EX', expireTimeSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch {
      console.log('[Redis] Health check failed');
      throw new ServiceUnavailableException('Service Not Available');
    }
  }

  // Called when the module initializes
  async onModuleInit() {
    if (await this.isHealthy()) {
      //console.log('[Redis] Health check passed on startup');
    }
  }

  // Disconnect Redis gracefully on app shutdown
  onModuleDestroy() {
    this.redis.disconnect();
    //console.log('[Redis] Disconnected on app shutdown');
  }
}
