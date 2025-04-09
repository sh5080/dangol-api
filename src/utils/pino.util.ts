import { randomUUID } from "crypto";
import { Options } from "pino-http";

const isDevelopment =
  process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development";
export const pinoHttpOptions: Options = {
  base: undefined,
  genReqId: (req, res) => req.id,
  serializers: {
    req(req) {
      req.id = randomUUID();
      req.body = req.raw.body;
      return req;
    },
    res(res) {
      delete res.headers;
      return res;
    },
    err(err) {
      err["config"] && delete err["config"]["transitional"];
      err["config"] && delete err["config"]["adapter"];
      err["config"] && delete err["config"]["transformRequest"];
      err["config"] && delete err["config"]["transformResponse"];
      err["config"] && delete err["config"]["xsrfCookieName"];
      err["config"] && delete err["config"]["xsrfHeaderName"];
      err["config"] && delete err["config"]["maxContentLength"];
      err["config"] && delete err["config"]["maxBodyLength"];
      err["config"] && delete err["config"]["env"];
      return err;
    },
  },
  customAttributeKeys: {
    req: "request",
    err: "error",
    reqId: "requestId",
    res: "response",
  },
  quietReqLogger: true,
  level: process.env.NODE_ENV !== "production" ? "debug" : "info",
  transport: {
    targets: [
      // 프로덕션 로그
      {
        target: "pino-pretty",
        options: {
          destination: "logs/app_prod.log",
          colorize: false,
          ignore: "context",
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
        },
        level: "info",
      },
      {
        target: "pino-pretty",
        options: {
          destination: "logs/error_prod.log",
          colorize: false,
          ignore: "context",
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
        },
        level: "error",
      },
      // 개발 환경 로그
      ...(isDevelopment
        ? [
            {
              target: "pino-pretty",
              options: {
                destination: 1, // 콘솔 출력
                colorize: true,
                ignore: "context",
                translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
              },
              level: "debug",
            },
            {
              target: "pino-pretty",
              options: {
                destination: "logs/app_dev.log",
                colorize: false,
                ignore: "context",
                translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
              },
              level: "debug",
            },
            {
              target: "pino-pretty",
              options: {
                destination: "logs/error_dev.log",
                colorize: false,
                ignore: "context",
                translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
              },
              level: "error",
            },
          ]
        : []),
    ],
  },
};
