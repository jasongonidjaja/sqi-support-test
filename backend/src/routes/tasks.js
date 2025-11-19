import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTaskStatus,
  assignSqiPic,
} from '../controllers/taskController.js';

const router = express.Router();

/* Upload Configuration */
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// ❌ fileFilter dihapus agar semua file diterima
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // max 50MB
});

/* Routes */
router.get('/', authenticate, authorize('sqi', 'developer'), getTasks);
router.get('/:id', authenticate, authorize('sqi', 'developer'), getTaskById);
router.post(
  '/',
  authenticate,
  authorize('developer'),
  upload.single('attachment'),
  createTask
);
router.put('/:id', authenticate, authorize('sqi'), updateTaskStatus);
router.put('/:id/assign', authenticate, authorize('sqi'), assignSqiPic);

export default router;
