import { query, Router } from "express";
import dotenv from "dotenv";
import { connection } from "../../db/mysql";
import path from "path";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import multer from "multer";
import jwt from "jsonwebtoken";

// env 사용 허용
dotenv.config();

const router = Router();
const pathName = "/client"; //pathname 설정
const secretKey = "nucode";


// s3 클라이언트 연결
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// 확장자 검사 목록
const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".gif", ".webp"];

const storage = multerS3({
  s3, // AWS S3 연결
  acl: "public-read", // S3 Bucket의 객체에 대한 읽기 권한
  bucket: process.env.AWS_BUCKET_NAME, // S3 Bucket의 이름
  contentType: multerS3.AUTO_CONTENT_TYPE, // 파일 MIME 타입 자동 지정
  key: (req, file, cb) => {
    // 확장자 검사
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return cb(new Error("확장자 에러"));
    }

    const fileName = file.originalname;

    cb(null, `nuworks/blogthumbnail/${fileName}`);
  },
});

// s3 파일 업로드 객체 생성
const upload = multer({
  storage, // 파일 스토리지 설정
  limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한
  defaultValue: { path: "", mimetype: "" }, // 기본 값
});

// 새로운 게시물 조회
const getTopPosts = (req, res, next) => {
  const getTopQuery = `SELECT 
    posts.id, 
    posts.thumbnail, 
    posts.title, 
    posts.content, 
    posts.author,
    posts.modifiedDate,
    posts.description,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'category_id', category.id,
            'category_name', category.categoryName
        )
    ) AS category
FROM 
    posts
INNER JOIN 
    category ON JSON_CONTAINS(posts.category, CAST(category.id AS JSON))
GROUP BY 
    posts.id
    ORDER BY posts.modifiedDate desc;`;

  try {
    connection.query(getTopQuery, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ posts: result[0] });
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 조회
const getAllPosts = (req, res, next) => {
  const getPostsQuery = `select * from posts order by modifiedDate desc`;

  try {
    connection.query(getPostsQuery, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ posts: result });
    });
  } catch (error) {
    next(error);
  }
};

// 슬라이드 게시물 조회
const getSlidePosts = (req, res, next) => {
  const getSlideQuery = `SELECT 
    slidePosts.id AS slide_id,
    slidePosts.title AS slide_title,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', posts.id,
            'thumbnail', posts.thumbnail,
            'title', posts.title,
            'content', posts.content,
            'author', posts.author,
            'category', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'category_id', category.id,
                        'category_name', category.categoryName
                    )
                )
                FROM category
                WHERE JSON_CONTAINS(posts.category, CAST(category.id AS JSON))
            ),
            'modifiedDate', posts.modifiedDate
        )
    ) AS posts
FROM 
    slidePosts
INNER JOIN 
    posts
ON 
    JSON_CONTAINS(slidePosts.posts_id, CAST(posts.id AS JSON))
GROUP BY 
    slidePosts.id;`;
  try {
    connection.query(getSlideQuery, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }

      res.status(200).json({ slidePosts: result[0] });
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 추가
const addPosts = (req, res, next) => {
  const thumbnail = req.file.location; // 게시물 썸네일 주소
  // 현재날짜 yyyy-mm-dd
  const date = new Date();
  const currentDate = date.toISOString().split("T")[0];
  const { title, content, author, category, description } = req.body; // 제목, 내용, 작성자, 카테고리

  const numberArray = Array.isArray(category)
    ? category.map(Number)
    : [Number(category)];

  const insertPostsQuery = `insert into posts (thumbnail, title, content, author, category, modifiedDate,description) values (?, ?, ?, ?, ? ,?,?)`;

  connection.query(
    insertPostsQuery,
    [
      thumbnail,
      title,
      content,
      author,
      JSON.stringify(numberArray),
      currentDate,
      description,
    ],
    (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }

      res.status(200).json({ Success: "success" });
    }
  );
  try {
  } catch (error) {
    next(error);
  }
};

// 카테고리 별 블로그 게시물 조회
const getCategorySortPosts = (req, res, next) => {
  const category_id = req.query.id; // 카테고리 id
  const page = req.query.page; // 게시물 Page

  const offset = page === 1 ? 0 : (page - 1) * 6;

  const categorySortQuery = `SELECT 
     posts.id, 
    posts.thumbnail, 
    posts.title, 
    posts.content, 
    posts.author,
    posts.modifiedDate,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'category_id', category.id,
            'category_name', category.categoryName
        )
    ) AS category
FROM 
    posts
INNER JOIN 
    category 
ON (? = 0 OR JSON_CONTAINS(category, CAST(? AS JSON)))
WHERE (JSON_CONTAINS(posts.category , CAST(category.id AS JSON)))
GROUP BY 
    posts.id ORDER BY posts.modifiedDate desc
   LIMIT ?, 6;
`;
  const totalPosts = `select count(*) as count from posts WHERE (? = 0 OR JSON_CONTAINS(category, CAST(? AS JSON)))`;

  try {
    connection.query(
      categorySortQuery,
      [category_id, category_id, offset],
      (err, result) => {
        if (err) {
          res.status(500).json({ Error: err.message });
        }
        connection.query(
          totalPosts,
          [category_id, category_id],
          (err, count) => {
            if (err) {
              res.status(500).json({ Error: err.message });
            }
            const totalCount = count[0]?.count || 0;
            res.status(200).json({ sortPosts: result, totalCount });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
};

// 상세 게시글 조회
const getPostsDetail = (req, res, next) => {
  const id = req.query.id;

  const getDetailQuery = `SELECT 
    posts.id, 
    posts.thumbnail, 
    posts.title, 
    posts.content, 
    posts.author,
    posts.modifiedDate,
    posts.description,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'category_id', category.id,
            'category_name', category.categoryName
        )
    ) AS category
FROM 
    posts
INNER JOIN 
    category ON JSON_CONTAINS(posts.category, CAST(category.id AS JSON))
WHERE posts.id = ?
GROUP BY 
    posts.id
 	`;
  try {
    connection.query(getDetailQuery, id, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ post: result[0] });
    });
  } catch (error) {
    next(error);
  }
};

// 카테고리 조회
const getCategoryList = (req, res, next) => {
  const getCategoryQuery = `select * from category`;

  try {
    connection.query(getCategoryQuery, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ categoryList: result });
    });
  } catch (error) {
    next(error);
  }
};

// 워크스페이스
const getWorkspaceList = (req, res, next) => {
  const getToken = req.get("Authorization");
  const verified = jwt.verify(getToken, secretKey);
  const getQuery = `select * from workspace where email = ?`;

  try {
    connection.query(getQuery, verified.email, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ workspace: result });
    });
  } catch (error) {
    next(error);
  }
};

// 워크스페이스 추가
const addWorkspace = (req, res, next) => {
  const getToken = req.get("Authorization");

  const verified = jwt.verify(getToken, secretKey);
  const date = new Date();
  const currentDate = date.toISOString().split("T")[0];


  const addQuery = `insert into workspace (email, createDate) values (?, ?)`;

  try {
    connection.query(addQuery, [verified.email, currentDate], (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ Success: "success" });
    });
  } catch (error) {
    next(error);
  }
};

// 워크스페이스 삭제
const deleteWorkspace = (req, res, next) => {
  const id = req.query.id;
  const deleteQuery = `delete from workspace where id = ?`;

  try {
    connection.query(deleteQuery, id, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ Success: "success" });
    });
  } catch (error) {
    next(error);
  }
};

// 워크스페이스 수정
const editWorkspace = (req, res, next) => {
  const { aiSystem, title, id } = req.body;

  let fields = [];
  let queryParams = [];

  if (title) {
    fields.push(`title = ?`);
    queryParams.push(title);
  }

  if (aiSystem) {
    fields.push(`aiSystem = ?`);
    queryParams.push(JSON.stringify(aiSystem));
  }

  if (fields.length === 0) {
    return res.status(400).json({ Error: "No fields to update" });
  }

  if (!id) {
    return res.status(400).json({ Error: "ID is required" });
  }

  queryParams.push(id);
  const finalQuery = `UPDATE workspace SET ${fields.join(', ')} WHERE id = ?`;
  console.log(finalQuery);

  try {
    connection.query(finalQuery, queryParams, (err, result) => {
      if (err) {
        return res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ Success: "success" });
    });
  } catch (error) {
    next(error);
  }
};


// 블로그
router.get('/allPosts', getAllPosts);
router.get("/topPosts", getTopPosts);
router.get("/slidePosts", getSlidePosts);
router.get("/categorySort", getCategorySortPosts);
router.get("/detail", getPostsDetail);
router.get("/categoryList", getCategoryList);
router.post("/posts", upload.single("thumbnail"), addPosts);

// 워크스페이스
router.get("/workspace", getWorkspaceList);
router.post("/workspace", addWorkspace);
router.delete("/workspace", deleteWorkspace);
router.patch("/workspace", editWorkspace);

export default {
  router,
  pathName,
};
