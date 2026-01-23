import { Provider, Logger } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const logger = new Logger('RedisProvider:ioredis');
    const host = process.env.REDIS_HOST ?? 'localhost';
    const port = parseInt(process.env.REDIS_PORT ?? '6379');
    const password = process.env.REDIS_PASSWORD;

    const redis = new Redis({
      host,
      port,
      password,
      retryStrategy: (times) => {
        // Retry every 2 seconds
        return Math.min(times * 50, 2000);
      },
    });

    redis.on('error', (err) => {
      logger.error(`Redis Connection Error: ${err.message}`);
    });

    redis.on('connect', () => {
      logger.log('Redis connected successfully');
    });

    return redis;
  },
};
