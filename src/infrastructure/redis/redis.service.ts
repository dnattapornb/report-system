import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.provider';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    await this.redis.set(key, value, 'EX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.redis.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.redis.smembers(key);
  }

  async hset(key: string, ...args: (string | number)[]): Promise<void> {
    await this.redis.hset(key, ...args);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(key);
  }

  async hmget(key: string, fields: string[]): Promise<(string | null)[]> {
    return await this.redis.hmget(key, ...fields);
  }

  async hmset(key: string, data: Record<string, string>): Promise<void> {
    await this.redis.hmset(key, data);
  }

  pipeline() {
    return this.redis.pipeline();
  }
}
