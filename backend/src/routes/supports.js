import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  upload,
  createSupport,
  // getDeploymentSupports,
  downloadAttachment,
  updateSupport,
} from "../controllers/supportController.js";

const router = express.Router();

// Create Support (developer only)
router.post(
  "/",
  authenticate,
  authorize("developer"),
  upload.single("attachment"),
  createSupport
);

// Get all supports (developer & sqi)
// router.get("/", authenticate, authorize("developer", "sqi"), getDeploymentSupports);

// Download attachment
router.get(
  "/download/:filename",
  authenticate,
  authorize("developer", "sqi"),
  downloadAttachment
);

// Update SQI PIC & Status
router.patch("/:id", authenticate, authorize("sqi"), updateSupport);

export default router;
