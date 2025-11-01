// src/routes/deploymentRequest.js
import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import models from "../models/index.js"; // ✅ ambil semua model + relasinya dari index.js
import multer from "multer";
import path from "path";
import { Op } from "sequelize";

const router = express.Router();
const { DeploymentRequest, Application } = models; // ✅ ambil model dari index.js

// ======================
// 📁 File Upload Setup
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Simpan file di folder "uploads"
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ======================
// 🟢 CREATE Deployment Request
// ======================
router.post(
  "/",
  authenticate,
  authorize("developer"),
  upload.single("attachment"),
  async (req, res) => {
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
        createdByUserId: req.user.userId, // ✅ dari JWT
      });

      res.status(201).json({
        message: "Request Deployment berhasil dibuat.",
        data: newRequest,
      });
    } catch (err) {
      console.error("❌ Error creating request deployment:", err);
      res.status(500).json({ error: "Gagal membuat request deployment" });
    }
  }
);

// ======================
// 🔹 GET all Deployment Requests (Developer & SQI bisa lihat)
// ======================
router.get("/", authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const requests = await DeploymentRequest.findAll({
      where: {
        implementDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Application,
          as: "application", // ⚠️ harus sama seperti di associate()
          attributes: ["id", "name"],
        },
      ],
      order: [["implementDate", "ASC"]],
    });

    console.log("🧩 DEBUG DEPLOYMENT REQUESTS =========================");
    requests.forEach((req) => {
      console.log({
        id: req.id,
        title: req.title,
        applicationId: req.applicationId,
        appName: req.application ? req.application.name : "❌ NULL",
      });
    });
    console.log("======================================================");

    res.json(requests);
  } catch (err) {
    console.error("❌ Error fetching requests:", err);
    res.status(500).json({ error: "Gagal memuat request deployment." });
  }
});

export default router;
