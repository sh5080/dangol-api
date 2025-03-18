import { Role } from "@prisma/client";
import { Request } from "express";

export interface AuthRequest extends Request {
  user: {
    userId: string;
    tokens?: { accessToken: string; refreshToken: string };
    role?: Role;
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
