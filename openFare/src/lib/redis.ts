import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis =
  globalForRedis.redis ??
  new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Helper functions for common caching patterns
export const cacheHelper = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    try {
      const stringified = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.set(key, stringified, 'EX', ttlSeconds);
      } else {
        await redis.set(key, stringified);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        return await redis.del(...keys);
      }
      return 0;
    } catch (error) {
      console.error('Redis INVALIDATE error:', error);
      return 0;
    }
  },
};

export default redis;