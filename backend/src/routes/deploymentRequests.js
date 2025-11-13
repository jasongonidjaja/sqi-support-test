// src/routes/deploymentRequests.js
import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  upload,
  createDeploymentRequest,
  // getDeploymentRequests,
  downloadAttachment,
  updateDeploymentRequest,
} from "../controllers/DeploymentRequestController.js";

const router = express.Router();

// Create Deployment Request (developer only)
router.post(
  "/",
  authenticate,
  authorize("developer"),
  upload.single("attachment"),
  createDeploymentRequest
);

// Get all deployment requests (developer & sqi)
// router.get("/", authenticate, authorize("developer", "sqi"), getDeploymentRequests);

// Download attachment
router.get(
  "/download/:filename",
  authenticate,
  authorize("developer", "sqi"), // hanya user terotorisasi yang boleh unduh
  downloadAttachment
);

router.patch("/:id", authenticate, authorize("sqi"), updateDeploymentRequest);

export default router;
