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

// 카테고리 추가
const addCategory = (req, res, next) => {
  const { categoryName } = req.body; //카테고리 이름

  // 카테고리 이름을 받아 카테고리 추가
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
  const getCategoryQuery = `SELECT 
    category.id,
    category.categoryName,
    category.createDate,
    IFNULL(COUNT(posts.id), 0) AS postCount
FROM 
    category
LEFT JOIN  
    posts 
ON 
    JSON_CONTAINS(posts.category, CAST(category.id AS JSON))
GROUP BY 
    category.id
    order by category.createDate desc;`;

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
  const { categoryName, id } = req.body; // 카테고리 이름과 카테고리 id

  // 카테고리 id와 일치하는 것에 카테고리 이름을 수정
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
  const { ids } = req.body;

  // id 배열의 요소 수만큼 `?`를 추가하여 쿼리 작성
  const placeholders = ids.map(() => "?").join(", ");
  const deleteCategoryQuery = `delete from category WHERE id IN (${placeholders})`;

  try {
    connection.query(deleteCategoryQuery, ids, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }

      res.status(200).json({ Success: "success" });
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 조회
const getPosts = (req, res, next) => {
  const page = req.query.page; // 페이지

  // 페이지를 받아 limit offset에 추가
  const offset = page === 1 ? 0 : (page - 1) * 6;

  // 게시글 조회
  const getPostsQuery = `select * from posts order by modifiedDate desc limit ?, 6 `;
  // 게시글에 전체 갯수
  const getTotalPosts = `select count(*) as count from posts`;

  try {
    connection.query(getPostsQuery, offset, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      connection.query(getTotalPosts, (err, count) => {
        if (err) {
          res.status(500).json({ Error: err.message });
        }
        const totalCount = count[0]?.count || 0;

        res.status(200).json({ posts: result, totalCount });
      });
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 상세 조회
const getDetailPosts = (req, res, next) => {
  const id = req.query.id; // 게시글 id

  const getDetailPostsQuery = `SELECT 
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
    ON JSON_CONTAINS(posts.category, CAST(category.id AS JSON))
WHERE 
    posts.id = ?
GROUP BY 
    posts.id;`;

  try {
    connection.query(getDetailPostsQuery, id, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ posts: result[0] });
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 수정
const editPosts = (req, res, next) => {
  const id = req.query.id; // 게시글 id
  const thumbnail = req.file.location; // 게시글 썸네일 주소
  const { title, content, author, category } = req.body; // 제목, 본문, 작성자, 카테고리
  const numberArray = category.map(Number); // [1, 2, 3] 이런식에 카테고리를 map으로 풀어 씀.
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

// 카테고리 별 블로그 게시물 조회
const getCategorySortPosts = (req, res, next) => {
  const category_id = req.query.id; // 카테고리 id

  const categorySortQuery = `SELECT category.categoryName,
JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', posts.id,
            'thumbnail', posts.thumbnail,
            'title', posts.title,
            'content', posts.content,
            'author', posts.author,
            'category', posts.category,
            'modifiedDate', posts.modifiedDate
        )
    ) AS posts
FROM 
    category
INNER JOIN 
    posts
on 
    JSON_CONTAINS(posts.category, CAST(? AS JSON))
WHERE 
    category.id = ?
GROUP BY 
   category.id;`;
  const totalPosts = `select count(*) as count from posts where JSON_CONTAINS(category, CAST(? AS JSON))`;

  try {
    connection.query(
      categorySortQuery,
      [category_id, category_id],
      (err, result) => {
        if (err) {
          res.status(500).json({ Error: err.message });
        }
        connection.query(totalPosts, category_id, (err, count) => {
          if (err) {
            res.status(500).json({ Error: err.message });
          }
          const totalCount = count[0]?.count || 0;
          res.status(200).json({ sortPosts: result, totalCount });
        });
      }
    );
  } catch (error) {
    next(error);
  }
};

// 게시글 삭제
const deletePosts = (req, res, next) => {
  const { ids } = req.body; // 여러개 게시글의 id

  // id 배열의 요소 수만큼 `?`를 추가하여 쿼리 작성
  const placeholders = ids.map(() => "?").join(", ");
  const deleteQuery = `delete from posts WHERE id IN (${placeholders})`;

  try {
    connection.query(deleteQuery, ids, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }

      res.status(200).json({ Success: "success" });
    });
  } catch (error) {
    next(error);
  }
};

// 슬라이드 게시물 수정
const editSlidePosts = (req, res, next) => {
  const { postsId, title } = req.body; // 슬라이드 게시물 id, 제목

  const updateSlideQuery = `update slidePosts set posts_id = ?, title = ? where id = 1`;
  try {
    connection.query(
      updateSlideQuery,
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

// 슬라이드 게시물 삭제
const deleteSlidePosts = (req, res, next) => {
  const id = req.query.id; // 슬라이드 게시물 삭제

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
            'category', posts.category,
            'modifiedDate', posts.modifiedDate
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

// 유저조회
const getUserList = (req, res, next) => {
  const getUserQuery = `select * from userList`;

  try {
    connection.query(getUserQuery, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }

      res.status(200).json({ user: result });
    });
  } catch (error) {
    next(error);
  }
};

// 유저상세조회
const getUserDetail = (req, res, next) => {
  const id = req.query.id; // 유저 아이디
  const getUserDetailQuery = `select * from userList where id = ?`;
  try {
    connection.query(getUserDetailQuery, id, (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message });
      }
      res.status(200).json({ userDetail: result });
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
router.get("/posts", getPosts);
router.get("/posts/detail", getDetailPosts);
router.patch("/posts", upload.single("thumbnail"), editPosts);
router.delete("/posts", deletePosts);
router.get("/categorySort", getCategorySortPosts);

// 슬라이드
router.patch("/slidePosts", editSlidePosts);
router.delete("/slidePosts", deleteSlidePosts);
router.get("/slidePosts", getSlidePosts);

// 유저
router.get("/user", getUserList);
router.get("/userDetail", getUserDetail);

export default {
  router,
  pathName,
};
