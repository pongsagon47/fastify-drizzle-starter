// src/modules/dev/dev.route.ts
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from '@/config/env.js';
import { z } from 'zod';
import {
  sendWelcomeMail,
  sendResetPasswordMail,
  sendOtpMail,
  sendCustomMail,
} from '@/utils/mailer/mailer.js';

export async function devRoutes(app: FastifyInstance) {
  // guard — ใช้ได้เฉพาะ development เท่านั้น
  if (env.NODE_ENV !== 'development') return;

  const zApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /dev/mail/templates — list templates ที่มีทั้งหมด
  zApp.get('/mail/templates', {
    schema: {
      tags: ['Dev'],
      summary: 'List available email templates',
    },
    handler: async (_req, reply) => {
      return reply.send({
        templates: ['welcome', 'reset-password', 'otp'],
        usage: 'POST /dev/mail/preview/:template',
      });
    },
  });

  // GET /dev/mail/preview/:template?name=สมชาย&loginUrl=http://localhost:3000
  zApp.get('/mail/preview/:template', {
    schema: {
      tags: ['Dev'],
      summary: 'Preview email template as HTML',
      params: z.object({
        template: z.string(),
      }),
      querystring: z.record(z.string(), z.string()).optional(),
    },
    handler: async (req, reply) => {
      const defaultData: Record<string, Record<string, unknown>> = {
        welcome: {
          title: 'ยินดีต้อนรับ',
          appName: 'My App',
          name: 'สมชาย ใจดี',
          loginUrl: 'http://localhost:3000/login',
        },
        'reset-password': {
          title: 'รีเซ็ตรหัสผ่าน',
          appName: 'My App',
          name: 'สมชาย ใจดี',
          resetLink: 'http://localhost:3000/reset-password?token=xxx',
          expiresIn: '30 นาที',
        },
        otp: {
          title: 'รหัส OTP ของคุณ',
          appName: 'My App',
          name: 'สมชาย ใจดี',
          otp: '123456',
          expiresIn: '5 นาที',
        },
      };

      // merge default + query string override
      const data = {
        ...(defaultData[req.params.template] ?? { title: req.params.template, appName: 'My App' }),
        ...req.query,
      };

      try {
        const { renderTemplate } = await import('@/utils/mailer/mailer.renderer.js');
        const html = await renderTemplate(req.params.template, data);
        return reply.type('text/html').send(html);
      } catch {
        return reply.code(404).send({ message: `Template "${req.params.template}" not found` });
      }
    },
  });

  // POST /dev/mail/send/:template — ส่ง email จริงไปที่ address ที่ระบุ
  zApp.post('/mail/send/:template', {
    schema: {
      tags: ['Dev'],
      summary: 'Send test email to specified address',
      params: z.object({
        template: z.string(),
      }),
      body: z.object({
        to: z.email(),
        data: z.record(z.string(), z.unknown()).optional(),
      }),
    },
    handler: async (req, reply) => {
      const { template } = req.params;
      const { to, data = {} } = req.body;

      if (!app.mailer) {
        return reply.code(503).send({ message: 'Mailer is not configured' });
      }

      await sendCustomMail(app.mailer, {
        to,
        subject: `[DEV TEST] ${template}`,
        template,
        data: {
          title: `[DEV] ${template}`,
          appName: 'My App',
          name: 'Test User',
          ...data,
        },
      });

      return reply.send({
        success: true,
        message: `Test email sent to ${to}`,
        template,
      });
    },
  });
}