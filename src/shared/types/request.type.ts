import { UserPayload } from "./data.type";
import { Request } from "express";

export interface AuthRequest extends Request {
  user: UserPayload & {
    tokens?: { accessToken: string; refreshToken: string };
  };
}
export interface ImageRequest extends Request {
  user: {
    userId: string;
    profile?: { imageUrl: string; originImageUrl: string };
  };
}
