import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gamification-projects', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // transformation: [{ width: 500, height: 500, crop: 'limit' }], // Optional: resize
  } as any, // Type assertion to avoid ts conflict with multer-storage-cloudinary types
});

const upload = multer({ storage: storage as any });

export default upload;
