import Redis from "ioredis";

let redisClient: Redis | null = null;

export function initRedis() {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  redisClient = new Redis(url);

  redisClient.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("Redis error", err);
  });

  return redisClient;
}

export function getRedis() {
  if (!redisClient) {
    throw new Error("Redis not initialized");
  }
  return redisClient;
}


