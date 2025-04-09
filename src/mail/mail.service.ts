import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { env } from "../configs/env.config";
import { Certification, CertificationType } from "../types/enum.type";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private mailOptions: nodemailer.SendMailOptions;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: env.mail.MAIL_SERVICE,
      port: env.mail.MAIL_PORT,
      host: env.mail.MAIL_HOST,
      secure: true,
      requireTLS: true,
      auth: { user: env.mail.MAIL_USER, pass: env.mail.MAIL_PASSWORD },
    });
    this.mailOptions = { from: "info@test.co.kr" };
  }

  /**
   * 인증 메일 템플릿
   */
  private getCertificationTemplate(authNum: number, purpose: string): string {
    return `
      <div style="width: 600px; height: 600px; text-align: center;">
          <h2 style="color: #006452;">test</h2>
          <p style="color: #151515;">테스트 ${purpose} 메일인증</p>
          <br/>
          <p style="color: #151515;">테스트 계정에 등록한 이메일 주소가 올바른지 확인하기 위한 인증번호입니다.</p>
          <p style="color: #151515;">아래의 인증번호를 복사하여 이메일 인증을 완료해 주세요.</p>
          <p style="color: #151515;">인증번호: <span style="color: #006452; font-weight: 700; font-size: 20px">${authNum}</span></p>
          <br/>
          <br/>
          <p style="color: #151515;">감사합니다.</p>
      </div>
    `;
  }

  /**
   * 인증 메일 전송
   */
  async sendCertificationMail(
    email: string,
    authNum: number,
    type: CertificationType
  ): Promise<void> {
    let title = "";
    switch (type) {
      case Certification.SIGNUP:
        title = "회원가입";
        break;
      case Certification.PASSWORD_RESET:
        title = "비밀번호 변경";
        break;
    }

    const options = {
      ...this.mailOptions,
      to: email,
      subject: `테스트 ${title} 인증 메일입니다.`,
      html: this.getCertificationTemplate(authNum, title),
    };

    await this.transporter.sendMail(options);
  }
}
