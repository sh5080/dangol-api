export const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  incr: jest.fn(),
  del: jest.fn(),
  hmset: jest.fn(),
  hgetall: jest.fn(),
  expire: jest.fn(),
};

export const mockRedisService = {
  userKey: jest.fn((key, userId) => `user:${userId}:${key}`),
};
