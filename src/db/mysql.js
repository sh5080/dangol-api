import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

export const connection = mysql.createConnection({
  host: "localhost",
  port: process.env.MYSQL_PORT,
  user: "root",
  password: process.env.MYSQL_PW,
  database: process.env.MYSQL_DATABASE,
});
