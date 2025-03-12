import { Module, Global } from "@nestjs/common";
import { RedisModule as IoRedisModule } from "@nestjs-modules/ioredis";
import { env } from "../configs/env.config";
import { RedisService } from "./redis.service";

@Global()
@Module({
  imports: [
    IoRedisModule.forRootAsync({
      useFactory: () => ({
        type: "single",
        url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`,
        options: {
          password: env.REDIS_PASSWORD,
          maxRetriesPerRequest: 1,
          enableReadyCheck: false,
          reconnectOnError: (err) => {
            console.error("Redis reconnectOnError:", err);
            return true;
          },
          retryStrategy: (times) => {
            return Math.min(times * 100, 3000);
          },
          disconnectTimeout: 2000,
        },
      }),
    }),
  ],
  providers: [RedisService],
  exports: [IoRedisModule, RedisService],
})
export class RedisModule {}
