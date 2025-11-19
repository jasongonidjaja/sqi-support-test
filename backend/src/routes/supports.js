import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  upload,
  createSupport,
  downloadAttachment,
} from '../controllers/supportController.js';

const router = express.Router();

// Create Support (developer only)
router.post(
  '/',
  authenticate,
  authorize('developer'),
  upload.single('attachment'),
  createSupport
);

// Download attachment
router.get(
  '/download/:filename',
  authenticate,
  authorize('developer', 'sqi'),
  downloadAttachment
);

export default router;
