import express from "express";
import helmet from "helmet";
import cors from "cors";
import controllers from "./controllers/index.js";
import { connection } from "./db/mysql.js";

const app = express();

// 미들웨어
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://dev.nuworks.io",
      "https://nuworks.io",
    ],
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "700mb" }));

controllers.forEach((controller) => {
  app.use(controller.pathName, controller.router);
});

app.get("/", (req, res) => {
  res.send("Express");
});

app.listen(8080, () => {
  console.log("서버가 시작되었습니다.");
});

// 5분마다 서버 재시작
setInterval(() => {
  connection.query(`select * from category`, (err, result) => {
    console.log(result);
  });
}, 5 * 60 * 1000); // 5분 (밀리초 단위)
