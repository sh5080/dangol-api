import nodemailer from "nodemailer";

export const smtpTransport = nodemailer.createTransport({
  service: "daouofficemail",
  port: 465,
  host: "outbound.daouoffice.com",
  secure: true,
  requireTLS: true,
  auth: {
    user: "dev@nucode.co.kr",
    pass: "junseok12!",
  },
});
