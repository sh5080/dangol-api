import { randomUUID } from "crypto";
import { Options } from "pino-http";

const isProduction = process.env.NODE_ENV === "production";
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
    err: (err) => {
      if (!err) return undefined;
      return {
        type: err.constructor?.name || "Error",
        message: err.message,
        stack: err.stack ? err.stack.replace(/\n\s*/g, " | ") : undefined,
        response: err.response,
        status: err.status || err.statusCode,
        path: err.path,
        method: err.method,
        ...err,
      };
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
  customLogLevel: (req, res) => {
    if (req.url === "/api/metrics") {
      return "silent";
    }
    if (res.statusCode >= 400) {
      return "error";
    }
    if (res.statusCode >= 300) {
      return "warn";
    }
    return "info";
  },
  transport: {
    targets: [
      ...(isProduction
        ? [
            {
              target: "pino-pretty",
              options: {
                destination: 1,
                colorize: false,
                singleLine: true,
                messageFormat: "{msg} {err.message}",
                ignore: "pid,hostname,context",
                errorLikeObjectKeys: ["err", "error"],
                errorProps: "*",
                minimumLevel: "info",
              },
              level: "info",
            },
          ]
        : [
            {
              target: "pino-pretty",
              options: {
                destination: 1,
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
          ]),
    ],
  },
};
