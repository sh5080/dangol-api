import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

export const connection = mysql.createConnection({
  // host: "localhost",
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  // user: "root",
  user: process.env.MYSQL_USER,
  // password: "junseok12!",
  password: process.env.MYSQL_PW,
  database: process.env.MYSQL_DEV_DATABASE,
  connectTimeout: 10000, // 10초
});
