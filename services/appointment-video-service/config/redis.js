const Redis = require('ioredis');

const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = Number(process.env.REDIS_PORT || 6379);

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 20,
  retryStrategy(times) {
    return Math.min(times * 100, 2000);
  },
});

redis.on('connect', () => {
  console.log(`Connected to Redis at ${redisHost}:${redisPort}`);
});

redis.on('reconnecting', (delay) => {
  console.log(`Reconnecting to Redis in ${delay}ms...`);
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redis;
