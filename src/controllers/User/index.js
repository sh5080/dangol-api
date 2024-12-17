import { Router } from "express";
import { connection } from "../../db/mysql";
import bcrypt, { hash } from "bcrypt";
import jwt, { sign } from "jsonwebtoken";
import dotenv from "dotenv";
import { smtpTransport } from "../../util/email.js";

// env 사용 허용
dotenv.config();

const router = Router();
const pathName = "/user"; //pathname 설정
const secretKey = "nucode";

// 현재날짜 yyyy-mm-dd
const date = new Date();
const currentDate = date.toISOString().split("T")[0];

// 회원 가입
const createUser = (req, res, next) => {
  try {
    const {
      email,
      name,
      password,
      affiliation,
      phoneNumber,
      userClass,
      event,
    } = req.body;

    bcrypt.hash(password, 10, (err, hashedPw) => {
      if (err) {
        return res
          .status(500)
          .json({ Error: "비밀번호 해싱 중 오류가 발생했습니다." });
      }
      const getUserQuery = `select * from userList where email = ?`;
      connection.query(getUserQuery, email, (err, result) => {
        if (err) {
          return res.status(500).json({ Error: err.message });
        }

        if (Array.isArray(result) && result.length > 0) {
          return res.status(400).json({
            message: "이미 가입된 아이디입니다.",
          });
        }

        const addUserQuery = `insert into userList
        (email, name, password, affiliation, phoneNumber,userClass, event, createDate) values
        (?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.query(
          addUserQuery,
          [
            email,
            name,
            hashedPw,
            affiliation,
            phoneNumber,
            userClass,
            event,
            currentDate,
          ],
          (err, result) => {
            if (err) {
              return res.status(500).json({ Error: err.message });
            }
            res.status(200).json({ Success: "success" });
          }
        );
      });
    });
  } catch (error) {
    next(error);
  }
};

// 로그인
const loginUser = (req, res, next) => {
  const { email, password } = req.body;
  const token = jwt.sign({ email }, secretKey, {
    expiresIn: "7d",
  });

  const searchUserQuery = `select * from userList where email = ?`;

  try {
    connection.query(searchUserQuery, email, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0]?.password, (err, same) => {
          if (err) {
            res.status(500).json({ Error: err.message });
          }
          if (
            result == "" ||
            result[0].password === undefined ||
            same === false
          ) {
            res.status(400).json({
              message: "아이디와 비밀번호를 확인해주세요.",
            });
          } else {
            if (same === true) {
              res.json({
                token: token,
              });
            }
          }
        });
      } else {
        res.status(400).json({ message: "아이디가 존재하지 않습니다." });
      }
    });
  } catch (error) {
    next(error);
  }
};

// 소셜 로그인
const socialLogin = (req, res, next) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, secretKey, {
    expiresIn: "7d",
  });

  const searchQuery = `select * from userList where email = ?`;
  try {
    if (email) {
      connection.query(searchQuery, email, (err, result) => {
        if (err) {
          res.status(500).json({ Error: err.message });
        }
        if (result?.length > 0) {
          res.status(200).json({ sing: false, token });
        } else {
          res.status(200).json({ sign: true });
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// 이메일 인증
const emailCertification = (req, res, next) => {
  const generateRandom = function (min, max) {
    const ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return ranNum;
  };

  const number = generateRandom(111111, 999999);

  const { email } = req.body;

  const mailOptions = {
    from: "info@nucode.co.kr",
    to: email,
    subject: "누코드 회원가입 인증 메일입니다.",
    html: `
      <div style=" width : 600px; height : 600px; text-align : center;">
          <h2 style="color : #006452;">NUCODE</h2>
          <p style="color : #151515;">누코드 회원가입 메일인증</p>
          <br/>
          <p style="color : #151515;">누코드 계정에 등록한 이메일 주소가 올바른지 확인하기 위한 인증번호입니다.</p>
          <p style="color : #151515;">아래의 인증번호를 복사하여 이메일 인증을 완료해 주세요.</p>
          <p style="color : #151515;">인증번호 : <span style="color :#006452; font-weight : 700; font-size : 20px">${number}</span></p>
          <br/>
          <br/>
          <p style="color : #151515;">새로고침을 하지말아주세요. 새로고침을 하게되면 이전 인증번호는 유효하지 않습니다.</p>
          <p style="color : #151515;">감사합니다.</p>
      </div>
      `,
  };

  const searchUserQuery = `select * from userList where email = ?`;

  try {
    connection.query(searchUserQuery, email, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }

      if (Array.isArray(result) && result.length > 0) {
        return res.status(400).json({
          message: "이미 가입된 이메일입니다.",
        });
      } else {
        smtpTransport.sendMail(mailOptions, (err, response) => {
          //   console.log("response", response);

          if (err) {
            res.status(400).json({ message: "메일 전송에 실패하였습니다." });
            smtpTransport.close();
            return;
          } else {
            res.status(200).json({
              message: "메일 전송에 성공하였습니다.",
              authNum: number,
            });
            smtpTransport.close();
            return;
          }
        });
      }
    });
  } catch (error) {
    next(error);
  }
};

// 유저 프로필 조회
const getUserProfile = (req, res, next) => {
  const getToken = req.get("Authorization");

  if (getToken) {
    const verified = jwt.verify(getToken, secretKey);
    const getUserQuery = `select * from userList where email = ?`;
    try {
      connection.query(getUserQuery, verified.email, (err, result) => {
        if (err) {
          return res.status(500).json({ Error: err.message });
        }
        res.status(200).json({ profile: result[0] });
      });
    } catch (error) {
      next(error);
    }
  } else {
    res.status(200).json({ message: "not found" });
  }
};

router.post("/crate", createUser);
router.post("/login", loginUser);
router.post("/emailCertification", emailCertification);
router.get("/profile", getUserProfile);
router.post("/social", socialLogin);

export default {
  router,
  pathName,
};
