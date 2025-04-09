import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";

@Injectable()
export class EncryptionService {
  private readonly algorithm = "aes-256-cbc";

  async hash(plainText: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(plainText, salt);
  }

  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return await bcrypt.compare(plainText, hashedText);
  }

  async encrypt(plainText: string, key: string): Promise<string> {
    const keyBuffer = crypto.createHash("sha256").update(key).digest();

    const iv = crypto.createHash("md5").update(plainText).digest();

    const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  async decrypt(encryptedText: string, key: string): Promise<string> {
    const keyBuffer = crypto.createHash("sha256").update(key).digest();

    const textParts = encryptedText.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedData = textParts.join(":");

    const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
