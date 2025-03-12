import { Injectable } from "@nestjs/common";
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { env } from "../configs/env.config";
import { Request } from "express";

@Injectable()
export class UploadService {
  private s3: S3Client;
  private upload: multer.Multer;

  constructor() {
    this.s3 = new S3Client({
      region: env.aws.AWS_REGION,
      credentials: {
        accessKeyId: env.aws.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.aws.AWS_SECRET_KEY,
      },
    });

    // 확장자 검사 목록
    const allowedExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".bmp",
      ".gif",
      ".webp",
    ];

    const storage = multerS3({
      s3: this.s3,
      acl: "public-read",
      bucket: env.aws.AWS_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, key?: string) => void
      ) => {
        // 확장자 검사
        const extension = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(extension)) {
          return cb(new Error("확장자 에러"));
        }

        const fileName = file.originalname;
        const date = new Date();
        const currentDate = date.toISOString().split("T")[0];

        cb(null, `nuworks/profile/${currentDate}_${fileName}`);
      },
    });

    this.upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
    });
  }

  getUploader() {
    return this.upload;
  }
}
