import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '@/config/env';

export function createMailTransporter(): Transporter | null {
  if (!env.MAIL_HOST || !env.MAIL_USER || !env.MAIL_PASS || !env.MAIL_FROM) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_PORT === 465,
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASS,
    },
  });
}