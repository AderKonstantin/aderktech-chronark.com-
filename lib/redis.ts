import Redis from "ioredis";

let redis: Redis | null = null;

export const getRedisClient = () => {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
    });
    
    redis.on("error", (err) => {
      console.error("Redis error:", err);
    });
  }
  return redis;
};