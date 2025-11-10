import { Op } from "sequelize";
import multer from "multer";
import fs from "fs";
import path from "path";
import models from "../models/index.js";

const { DeploymentSupport } = models;

// ======================
// 📁 File Upload Setup
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

// ======================
// 🟢 CREATE Deployment Support
// ======================
export const createDeploymentSupport = async (req, res) => {
  try {
    const { application, title, implementDate, impactedApplication, note, riskImpact } = req.body;
    const attachmentPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    // 🔍 Validasi tanggal implementasi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(implementDate);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ error: "Format tanggal implementasi tidak valid." });
    }

    if (selectedDate < today) {
      return res.status(400).json({ error: "Tanggal implementasi tidak boleh kurang dari hari ini." });
    }

    const newSupport = await DeploymentSupport.create({
      application,
      title,
      implementDate,
      impactedApplication,
      note,
      riskImpact,
      attachment: attachmentPath,
      createdByUserId: req.user.userId,
      sqiPicId: null,
      status: null,
    });

    res.status(201).json({
      message: "✅ Deployment Support berhasil dibuat.",
      data: newSupport,
    });
  } catch (err) {
    console.error("❌ Error creating deployment support:", err);
    res.status(500).json({
      error: "Gagal membuat deployment support.",
      details: err.message,
    });
  }
};

// ======================
// 🔹 GET all Deployment Supports
// ======================
export const getDeploymentSupports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "Harap sertakan startDate dan endDate di query params.",
      });
    }

    const supports = await DeploymentSupport.findAll({
      where: {
        implementDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["implementDate", "ASC"]],
    });

    res.json({
      message: "✅ Data deployment support berhasil dimuat.",
      count: supports.length,
      data: supports,
    });
  } catch (err) {
    console.error("❌ Error fetching deployment supports:", err);
    res.status(500).json({
      error: "Gagal memuat data deployment support.",
      details: err.message,
    });
  }
};

// ======================
// 📦 DOWNLOAD ATTACHMENT
// ======================
export const downloadAttachment = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ error: "Nama file tidak ditemukan di parameter." });
    }

    const filePath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File tidak ditemukan di server." });
    }

    const extension = path.extname(filename).toLowerCase();
    let mimeType = "application/octet-stream";
    if (extension === ".csv") mimeType = "text/csv";
    if (extension === ".xlsx") mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    res.setHeader("Content-Type", mimeType);
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("❌ Error saat mengirim file:", err);
        res.status(500).json({ error: "Gagal mengunduh file." });
      }
    });
  } catch (err) {
    console.error("❌ Error di downloadAttachment:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat mengunduh file." });
  }
};

// ======================
// 🟡 UPDATE SQI PIC & STATUS
// ======================
export const updateDeploymentSupport = async (req, res) => {
  try {
    const { id } = req.params;
    const { sqiPicId, status } = req.body;

    const support = await DeploymentSupport.findByPk(id);
    if (!support) {
      return res.status(404).json({ error: "Deployment support tidak ditemukan." });
    }

    const validStatuses = [null, "success", "cancel"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status tidak valid." });
    }

    // ✅ Bisa update terpisah: SQI PIC saja atau status saja
    if (sqiPicId !== undefined) support.sqiPicId = sqiPicId || null;
    if (status !== undefined) support.status = status || null;

    await support.save();

    res.status(200).json({
      message: "✅ Deployment support berhasil diperbarui.",
      data: support,
    });
  } catch (err) {
    console.error("❌ Error updating deployment support:", err);
    res.status(500).json({
      error: "Gagal memperbarui deployment support.",
      details: err.message,
    });
  }
};
