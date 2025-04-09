import { Module, Global } from "@nestjs/common";
import { RedisModule as IoRedisModule } from "@nestjs-modules/ioredis";
import { env } from "@shared/configs/env.config";
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
          connectTimeout: 10000,
          commandTimeout: 5000,
          keepAlive: 10000,
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          retryStrategy: (times) => {
            return Math.min(times * 200, 5000);
          },
          reconnectOnError: (err) => {
            console.error("Redis reconnectOnError:", err);
            return true;
          },
        },
      }),
    }),
  ],
  providers: [RedisService],
  exports: [IoRedisModule, RedisService],
})
export class RedisModule {}
