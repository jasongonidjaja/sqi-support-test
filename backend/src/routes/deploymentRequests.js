// src/routes/deploymentRequest.js
import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import DeploymentRequest from "../models/DeploymentRequest.js"; // Model baru untuk request deployment
import multer from "multer";
import path from "path";

const router = express.Router();

// Set up multer untuk file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Menyimpan file di folder "uploads"
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Endpoint untuk membuat request deployment
router.post("/", authenticate, authorize("developer"), upload.single("attachment"), async (req, res) => {
  try {
    const { releaseId, title, implementDate, applicationId, riskImpact } = req.body;
    const attachmentPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const newRequest = await DeploymentRequest.create({
      releaseId,
      title,
      implementDate,
      applicationId,
      riskImpact,
      attachment: attachmentPath,
      userId: req.user.userId, // Menyimpan siapa yang membuat request
    });

    res.status(201).json({
      message: "Request Deployment berhasil dibuat.",
      data: newRequest,
    });
  } catch (err) {
    console.error("❌ Error creating request deployment:", err);
    res.status(500).json({ error: "Gagal membuat request deployment" });
  }
});

// 🔹 Get all Deployment Requests (Developer & SQI bisa lihat)
router.get("/", authenticate, async (req, res) => {
  try {
    const requests = await DeploymentRequest.findAll({
      order: [["implementDate", "ASC"]],
    });
    res.json(requests);
  } catch (err) {
    console.error("❌ Error fetching requests:", err);
    res.status(500).json({ error: "Gagal memuat request deployment." });
  }
});

export default router;
