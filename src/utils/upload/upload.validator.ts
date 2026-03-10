import sharp from 'sharp';
import { UPLOAD_CONFIG, type AspectRatioPreset } from '@/config/upload';
import { formatBytes } from './upload.helper';
import { ValidationError } from '@/shared/errors';

export interface ImageDimensions {
  width: number;
  height: number;
}

export function validateMimeType(mimeType: string, type: 'image' | 'document'): void {
  const allowed = UPLOAD_CONFIG.allowedMimeTypes[type] as readonly string[];
  if (!allowed.includes(mimeType)) {
    throw new ValidationError(
      `ไม่รองรับไฟล์ประเภท "${mimeType}" ประเภทที่รองรับ: ${allowed.join(', ')}`
    );
  }
}

export function validateFileSize(size: number, type: 'image' | 'document' | 'default'): void {
  const max = UPLOAD_CONFIG.maxFileSize[type];
  if (size > max) {
    throw new ValidationError(
      `ไฟล์มีขนาด ${formatBytes(size)} เกินขนาดสูงสุดที่กำหนด ${formatBytes(max)}`
    );
  }
}

export function validateAspectRatio(
  dimensions: ImageDimensions,
  preset: AspectRatioPreset
): void {
  const { ratio, tolerance } = UPLOAD_CONFIG.aspectRatio[preset];
  const actualRatio = dimensions.width / dimensions.height;
  const diff = Math.abs(actualRatio - ratio);

  if (diff > tolerance) {
    const labels: Record<AspectRatioPreset, string> = {
      square: '1:1',
      landscape: '16:9',
      portrait: '3:4',
      banner: '3:1',
    };
    throw new ValidationError(
      `อัตราส่วนภาพไม่ถูกต้อง ต้องการ ${labels[preset]} (ได้รับ ${dimensions.width}x${dimensions.height})`
    );
  }
}

export async function getImageDimensions(buffer: Buffer): Promise<ImageDimensions> {
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height) {
    throw new ValidationError('ไม่สามารถอ่านขนาดรูปภาพได้');
  }
  return { width: meta.width, height: meta.height };
}
