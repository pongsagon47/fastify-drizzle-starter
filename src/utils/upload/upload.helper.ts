import { randomBytes } from 'node:crypto';
import { extname } from 'node:path';

/**
 * Sanitize filename รองรับภาษาไทย + ชื่อ original
 * เช่น "รูปภาพ สวยงาม.jpg" → "รูปภาพ_สวยงาม_a1b2c3d4.webp"
 */
export function sanitizeFilename(originalName: string, forceExt?: string): string {
  const ext = forceExt ?? extname(originalName).toLowerCase();
  const nameWithout = originalName.slice(0, originalName.length - extname(originalName).length);

  const sanitized = nameWithout
    .trim()
    .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\-_.]/g, '_') // เก็บ Thai + EN + ตัวเลข
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50);

  const suffix = randomBytes(4).toString('hex');
  return `${sanitized}_${suffix}${ext}`;
}

/**
 * แบ่ง path ตาม year/month เพื่อไม่ให้ folder ใหญ่เกินไป
 * เช่น uploads/images/2025/03/
 */
export function getUploadPath(type: 'images' | 'documents', basePath: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${basePath}/${type}/${year}/${month}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
