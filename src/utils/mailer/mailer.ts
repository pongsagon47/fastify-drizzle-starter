import type { Transporter } from 'nodemailer';
import { renderTemplate } from './mailer.renderer.js';
import { env } from '@/config/env.js';
import { AppError } from '@/shared/errors.js';

function assertMailer(transporter: Transporter | null): asserts transporter is Transporter {
  if (!transporter) {
    throw new AppError('Mailer is not configured', 503, 'MAILER_NOT_CONFIGURED');
  }
}

interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
}

function sendMail(transporter: Transporter, options: SendMailOptions) {
  assertMailer(transporter);
  return transporter.sendMail({
    from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM}>`,
    ...options,
  });
}

// --- Welcome ---
export interface WelcomeMailOptions {
  name: string;
  loginUrl: string;
}

export function sendWelcomeMail(
  transporter: Transporter,
  to: string,
  options: WelcomeMailOptions
) {
  return renderTemplate('welcome', {
    title: `ยินดีต้อนรับสู่ ${env.MAIL_FROM_NAME}`,
    appName: env.MAIL_FROM_NAME,
    ...options,
  }).then(html => sendMail(transporter, {
    to,
    subject: `ยินดีต้อนรับสู่ ${env.MAIL_FROM_NAME}`,
    html,
  }));
}

// --- Reset Password ---
export interface ResetPasswordMailOptions {
  name: string;
  resetLink: string;
  expiresIn: string;
}

export async function sendResetPasswordMail(
  transporter: Transporter,
  to: string,
  options: ResetPasswordMailOptions
) {
  const html = await renderTemplate('reset-password', {
    title: 'รีเซ็ตรหัสผ่าน',
    appName: env.MAIL_FROM_NAME,
    ...options,
  });
  return sendMail(transporter, { to, subject: 'รีเซ็ตรหัสผ่าน', html });
}

// --- OTP ---
export interface OtpMailOptions {
  name: string;
  otp: string;
  expiresIn: string;
}

export async function sendOtpMail(
  transporter: Transporter,
  to: string,
  options: OtpMailOptions
) {
  const html = await renderTemplate('otp', {
    title: 'รหัส OTP ของคุณ',
    appName: env.MAIL_FROM_NAME,
    ...options,
  });
  return sendMail(transporter, { to, subject: 'รหัส OTP ของคุณ', html });
}

// --- Custom --- สำหรับ template ใหม่ที่เพิ่มทีหลัง
export interface CustomMailOptions {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, unknown>;
  cc?: string[];
  bcc?: string[];
}

export async function sendCustomMail(
  transporter: Transporter,
  options: CustomMailOptions
) {
  const html = await renderTemplate(options.template, {
    appName: env.MAIL_FROM_NAME,
    ...options.data,
  });
  return sendMail(transporter, {
    to: options.to,
    subject: options.subject,
    html,
    cc: options.cc,
    bcc: options.bcc,
  });
}
