import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { env } from '@/config/env.js';

export const corsPlugin = fp(async (app) => {
  app.register(cors, {
    // ระบุ domain ที่อนุญาตชัดเจน
    origin: getAllowedOrigins(),

    // HTTP methods ที่อนุญาต
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Headers ที่ client ส่งมาได้
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'X-Api-Key',       // ถ้ามี API key
    ],

    // Headers ที่ expose ให้ client อ่านได้
    exposedHeaders: [
      'X-Total-Count',   // สำหรับ pagination
      'X-Request-Id',
    ],

    credentials: true,   // รองรับ cookie / Authorization header
    maxAge: 86400,       // cache preflight 24 ชั่วโมง (ลด OPTIONS request)
  });
});

function getAllowedOrigins() {
  if (env.NODE_ENV === 'development') {
    return true; // allow ทุก origin ใน dev
  }

  // prod — อ่านจาก env เพื่อ flexible
  const origins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

  // รองรับ RegExp ด้วยถ้าต้องการ subdomain
  // เช่น /https:\/\/.*\.arip\.co\.th$/
  return origins;
}