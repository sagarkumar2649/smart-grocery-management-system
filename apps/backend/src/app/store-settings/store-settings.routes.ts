import { Router } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../../infrastructure/cloudinary/cloudinary.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { getStoreSettings, updateStoreSettings } from './store-settings.controller.js';
import type { Request } from 'express';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'smart-inventory/store-settings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, height: 900, crop: 'limit', quality: 'auto' }],
  } as Record<string, unknown>,
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
}).fields([
  { name: 'heroBanner', maxCount: 1 },
  { name: 'storeFront', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
  { name: 'interiorGallery', maxCount: 10 },
]);

export function buildStoreSettingsRouter(): Router {
  const router = Router();

  router.get('/', getStoreSettings);
  router.put('/', requireAdmin, upload, updateStoreSettings);

  return router;
}
