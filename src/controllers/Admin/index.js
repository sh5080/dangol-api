import { query, Router } from "express";
import { connection } from "../../db/mysql";
import dotenv from "dotenv";
import path from "path";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import multer from "multer";

// env 사용 허용
dotenv.config();

const router = Router();
const pathName = "/admin"; //pathname 설정

// 현재날짜 yyyy-mm-dd
const date = new Date();
const currentDate = date.toISOString().split("T")[0];

// s3 클라이언트 연결
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// 확장자 검사 목록
const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".gif"];

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

// 카테고리 추가
const addCategory = (req, res, next) => {
  const { categoryName } = req.body;
  const insertCategoryQuery = `insert into category (categoryName, createDate) values(?, ?)`;

  try {
    connection.query(
      insertCategoryQuery,
      [categoryName, currentDate],
      (err, result) => {
        if (err) {
          res.status(500).json({ Error: err.message });
        }
        res.status(200).json({ Success: "success" });
      }
    );
  } catch (error) {
    next(error);
  }
};

// 카테고리 조회
const getCategory = (req, res, next) => {
  const getCategoryQuery = `select * from category order by createDate desc`;

  try {
    connection.query(getCategoryQuery, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ category: result });
    });
  } catch (error) {
    next(error);
  }
};

// 카테고리 수정
const editCategory = (req, res, next) => {
  const { categoryName, id } = req.body;
  const patchCategoryQuery = `update category set categoryName = ? where id = ?`;

  try {
    connection.query(patchCategoryQuery, [categoryName, id], (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }

      res.status(200).json({ Success: "success" });
    });
  } catch (error) {
    next(error);
  }
};

// 카테고리 삭제
const deleteCategory = (req, res, next) => {
  const { id } = req.body;

  const deleteCategoryQuery = `delete from category where id = ?`;

  try {
    connection.query(deleteCategoryQuery, id, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }

      res.status(200).json({ Success: "success" });
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 추가
const addPosts = (req, res, next) => {
  const thumbnail = req.file.location;
  const { title, content, author, category } = req.body;

  const numberArray = category.map(Number);

  const insertPostsQuery = `insert into posts (thumbnail, title, content, author, category, modifiedDate) values (?, ?, ?, ?, ? ,?)`;

  connection.query(
    insertPostsQuery,
    [
      thumbnail,
      title,
      content,
      author,
      JSON.stringify(numberArray),
      currentDate,
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

// 게시글 조회
const getPosts = (req, res, next) => {
  const getPostsQuery = `select * from posts`;

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

// 게시글 상세 조회
const getDetailPosts = (req, res, next) => {
  const id = req.query.id;

  const getDetailPostsQuery = `select * from posts where id =?`;

  try {
    connection.query(getDetailPostsQuery, id, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ posts: result });
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 수정
const editPosts = (req, res, next) => {
  const id = req.query.id;
  const thumbnail = req.file.location;
  const { title, content, author, category } = req.body;
  const numberArray = category.map(Number);
  const editPostsQuery = `update posts set thumbnail = ?, title = ?, content = ?, author = ?, category = ?, modifiedDate = ? WHERE id = ?`;

  try {
    connection.query(
      editPostsQuery,
      [
        thumbnail,
        title,
        content,
        author,
        JSON.stringify(numberArray),
        currentDate,
        id,
      ],
      (err, result) => {
        if (err) {
          res.status(500).json({ Error: err.message });
        }
        res.status(200).json({ Success: "success" });
      }
    );
  } catch (error) {
    next(error);
  }
};

// 게시글 삭제
const deletePosts = (req, res, next) => {
  const id = req.query.id;

  const deletePostsQuery = `delete from posts where id = ?`;
  try {
    connection.query(deletePostsQuery, id, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }

      res.status(200).json({ Success: "success" });
    });
  } catch (error) {
    next(error);
  }
};

// 슬라이드 게시물 추가
const addSlidePosts = (req, res, next) => {
  const { postsId, title } = req.body;

  const insertSlideQuery = `insert into slidePosts (posts_id, title) values (?, ?)`;

  try {
    connection.query(
      insertSlideQuery,
      [JSON.stringify(postsId), title],
      (err, result) => {
        if (err) {
          res.status(500).json({ Error: err.message });
        }

        res.status(200).json({ Success: "success" });
      }
    );
  } catch (error) {
    next(error);
  }
};

// 슬라이드 게시물 수정
const editSlidePosts = (req, res, next) => {
  const id = req.query.id;
  const { postsId, title } = req.body;

  const updateSlideQuery = `update slidePosts set posts_id = ?, title = ?4 where id = ?`;
  try {
    connection.query(
      updateSlideQuery,
      [JSON.stringify(postsId), title, id],
      (err, result) => {
        if (err) {
          res.status(500).json({ Error: err.message });
        }
        res.status(200).json({ Success: "success" });
      }
    );
  } catch (error) {
    next(error);
  }
};

const deleteSlidePosts = (req, res, next) => {
  const id = req.query.id;

  const deleteSlideQuery = `delete from slidePosts where id = ?`;

  try {
    connection.query(deleteSlideQuery, id, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ Success: "success" });
    });
  } catch (error) {
    next(error);
  }
};

const getSlidePosts = (req, res, next) => {
  const getSlideQuery = `SELECT 
    slidePosts.id AS slide_id,
    slidePosts.title AS slide_title,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'post_id', posts.id,
            'thumbnail', posts.thumbnail,
            'title', posts.title,
            'content', posts.content,
            'author', posts.author,
            'category', posts.category,
            'modifiedDate', posts.modifiedDate,
            'createDate', posts.createDate
        )
    ) AS posts,
    JSON_ARRAYAGG(posts.id) AS posts_id
FROM 
    slidePosts
INNER JOIN 
    posts
ON 
    JSON_CONTAINS(slidePosts.posts_id, CAST(posts.id AS JSON))
GROUP BY 
    slidePosts.id;
`;
  try {
    connection.query(getSlideQuery, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }

      res.status(200).json({ slidePosts: result });
    });
  } catch (error) {
    next(error);
  }
};

// 카테고리
router.post("/category", addCategory);
router.get("/category", getCategory);
router.patch("/category", editCategory);
router.delete("/category", deleteCategory);

// 게시물
router.post("/posts", upload.single("thumbnail"), addPosts);
router.get("/posts", getPosts);
router.get("/posts/detail", getDetailPosts);
router.patch("/posts", upload.single("thumbnail"), editPosts);
router.delete("/posts", deletePosts);

// 슬라이드
router.post("/slidePosts", addSlidePosts);
router.patch("/slidePosts", editSlidePosts);
router.delete("/slidePosts", deleteSlidePosts);
router.get("/slidePosts", getSlidePosts);

export default {
  router,
  pathName,
};
