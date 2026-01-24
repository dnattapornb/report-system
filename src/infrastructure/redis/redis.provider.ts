import { Provider, Logger } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const logger = new Logger('RedisProvider:ioredis');
    const host = process.env.REDIS_HOST ?? 'localhost';
    const port = parseInt(process.env.REDIS_PORT ?? '6379', 10);
    const password = process.env.REDIS_PASSWORD;
    const url = process.env.REDIS_URL;

    // Create a Redis instance, prioritizing the URL. If not available, fall back to Host/Port.
    const redis = url
      ? new Redis(url, {
          // Options for URL-based connection
          retryStrategy: (times) => Math.min(times * 50, 2000),
        })
      : new Redis({
          // Options for Host/Port-based connection
          host,
          port,
          password,
          retryStrategy: (times) => Math.min(times * 50, 2000),
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
