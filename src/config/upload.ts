export const UPLOAD_CONFIG = {
  basePath: process.env.UPLOAD_PATH ?? 'uploads',

  maxFileSize: {
    image: 5 * 1024 * 1024,  // 5MB
    document: 10 * 1024 * 1024,  // 10MB
    default: 5 * 1024 * 1024,
  },

  allowedMimeTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
  },

  resize: {
    thumbnail: { width: 200, height: 200 },
    medium: { width: 800, height: 800 },
    large: { width: 1920, height: 1080 },
  },

  aspectRatio: {
    square: { ratio: 1, tolerance: 0.05 },
    landscape: { ratio: 16 / 9, tolerance: 0.05 },
    portrait: { ratio: 3 / 4, tolerance: 0.05 },
    banner: { ratio: 3 / 1, tolerance: 0.05 },
  },
} as const;

export type ResizePreset = keyof typeof UPLOAD_CONFIG.resize;
export type AspectRatioPreset = keyof typeof UPLOAD_CONFIG.aspectRatio;
