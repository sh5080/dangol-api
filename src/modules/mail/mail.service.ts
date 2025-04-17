import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { env } from "@shared/configs/env.config";
import { MailType, SendMailType } from "@shared/types/enum.type";

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
    this.mailOptions = { from: env.mail.MAIL_USER };
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
  private getApprovedTemplate(purpose: string): string {
    return `
      <div style="width: 600px; height: 600px; text-align: center;">
          <h2 style="color: #006452;">test</h2>
          <p style="color: #151515;">테스트 ${purpose} 안내 메일</p>
          <br/>
          <p style="color: #151515;">승인이 완료되었습니다.</p>
          <br/>
          <br/>
          <p style="color: #151515;">감사합니다.</p>
      </div>
    `;
  }

  /**
   * 인증 메일 전송
   */
  async sendMail(
    email: string,
    type: SendMailType,
    authNum?: number
  ): Promise<void> {
    let title = "";
    let template = "";
    switch (type) {
      case MailType.RESTAURANT_APPROVED:
        title = "매장 승인 완료";
        template = this.getApprovedTemplate(title);
        break;
      case MailType.CHANGE_PASSWORD:
        title = "비밀번호 재설정";
        template = this.getCertificationTemplate(authNum!, title);
        break;
    }

    const options = {
      ...this.mailOptions,
      to: email,
      subject: `테스트 ${title} 메일입니다.`,
      html: template,
    };
    await this.transporter.sendMail(options);
  }
}
