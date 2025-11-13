import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  upload,
  createDeploymentSupport,
  // getDeploymentSupports,
  downloadAttachment,
  updateDeploymentSupport,
} from "../controllers/DeploymentSupportController.js";

const router = express.Router();

// Create Deployment Support (developer only)
router.post(
  "/",
  authenticate,
  authorize("developer"),
  upload.single("attachment"),
  createDeploymentSupport
);

// Get all deployment supports (developer & sqi)
// router.get("/", authenticate, authorize("developer", "sqi"), getDeploymentSupports);

// Download attachment
router.get(
  "/download/:filename",
  authenticate,
  authorize("developer", "sqi"),
  downloadAttachment
);

// Update SQI PIC & Status
router.patch("/:id", authenticate, authorize("sqi"), updateDeploymentSupport);

export default router;
