import sharp from 'sharp';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { UPLOAD_CONFIG, type ResizePreset, type AspectRatioPreset } from '@/config/upload';
import { sanitizeFilename, getUploadPath } from './upload.helper';
import {
  validateMimeType,
  validateFileSize,
  validateAspectRatio,
  getImageDimensions,
} from './upload.validator';

export interface UploadResult {
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface UploadImageOptions {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  resize?: ResizePreset;
  aspectRatio?: AspectRatioPreset;  // optional — validate ratio ก็ต่อเมื่อระบุ
}

export interface UploadDocumentOptions {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

// --- Upload Image ---
export async function uploadImage(options: UploadImageOptions): Promise<UploadResult> {
  const { buffer, originalName, mimeType, resize, aspectRatio } = options;

  validateMimeType(mimeType, 'image');
  validateFileSize(buffer.length, 'image');

  const dimensions = await getImageDimensions(buffer);

  if (aspectRatio) {
    validateAspectRatio(dimensions, aspectRatio);
  }

  const isGif = mimeType === 'image/gif';
  let image = sharp(buffer);

  if (resize) {
    const { width, height } = UPLOAD_CONFIG.resize[resize];
    image = image.resize(width, height, { fit: 'inside', withoutEnlargement: true });
  }

  // convert เป็น webp ยกเว้น gif
  const outputBuffer: Buffer = isGif
    ? await image.toBuffer()
    : await image.webp({ quality: 85 }).toBuffer();

  const ext = isGif ? '.gif' : '.webp';
  const filename = sanitizeFilename(originalName, ext);
  const uploadPath = getUploadPath('images', UPLOAD_CONFIG.basePath);
  const fullPath = join(uploadPath, filename);

  await mkdir(uploadPath, { recursive: true });
  await writeFile(fullPath, outputBuffer);

  const finalMeta = await sharp(outputBuffer).metadata();

  return {
    originalName,
    filename,
    path: fullPath,
    size: outputBuffer.length,
    mimeType: isGif ? 'image/gif' : 'image/webp',
    width: finalMeta.width,
    height: finalMeta.height,
  };
}

// --- Upload Document ---
export async function uploadDocument(options: UploadDocumentOptions): Promise<UploadResult> {
  const { buffer, originalName, mimeType } = options;

  validateMimeType(mimeType, 'document');
  validateFileSize(buffer.length, 'document');

  const filename = sanitizeFilename(originalName);
  const uploadPath = getUploadPath('documents', UPLOAD_CONFIG.basePath);
  const fullPath = join(uploadPath, filename);

  await mkdir(uploadPath, { recursive: true });
  await writeFile(fullPath, buffer);

  return { originalName, filename, path: fullPath, size: buffer.length, mimeType };
}

// --- Delete ---
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {
    // ไม่ throw ถ้าไฟล์ไม่มีอยู่แล้ว
  }
}
