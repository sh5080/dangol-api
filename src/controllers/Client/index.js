import { query, Router } from "express";
import dotenv from "dotenv";
import { connection } from "../../db/mysql";

// env 사용 허용
dotenv.config();

const router = Router();
const pathName = "/client"; //pathname 설정

const getTopPosts = (req, res, next) => {
  const getTopQuery = `select * from posts order by createDate desc`;

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

const getCategorySortPosts = (req, res, next) => {
  const category_id = req.query.id;

  const { page } = req.body;

  const offset = page === 1 ? 0 : (page - 1) * 6;

  const categorySortQuery = `select * from posts where JSON_CONTAINS(category, CAST(? AS JSON)) limit ?, 6`;
  const totalPosts = `select count(*) as count from posts where JSON_CONTAINS(category, CAST(? AS JSON))`;

  try {
    connection.query(
      categorySortQuery,
      [category_id, offset],
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

router.get("/topPosts", getTopPosts);
router.get("/slidePosts", getSlidePosts);
router.get("/category", getCategorySortPosts);
router.get("/categoryList", getCategoryList);

export default {
  router,
  pathName,
};
