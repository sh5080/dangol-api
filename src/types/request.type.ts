import { Request } from "express";

export interface AuthRequest extends Request {
  user: {
    userId: string;
    tokens?: { accessToken: string; refreshToken: string };
  };
  fileUrl: string;
}
export interface ImageRequest extends Request {
  user: {
    userId: string;
    profile?: { imageUrl: string; originImageUrl: string };
  };
  fileUrl: string;
}
