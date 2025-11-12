// src/controllers/deploymentRequestController.js
import { Op } from "sequelize";
import multer from "multer";
import models from "../models/index.js";

const { DeploymentRequest, Application } = models;

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
// 🟢 CREATE Deployment Request
// ======================
export const createDeploymentRequest = async (req, res) => {
  try {
    const { releaseId, title, implementDate, applicationId, riskImpact } = req.body;
    const attachmentPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    // ======================
    // 🔍 Validasi tanggal implementasi
    // ======================
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset waktu jadi 00:00:00 agar perbandingan adil
    const selectedDate = new Date(implementDate);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        error: "Format tanggal implementasi tidak valid.",
      });
    }

    if (selectedDate < today) {
      return res.status(400).json({
        error: "Tanggal implementasi tidak boleh kurang dari hari ini.",
      });
    }

    // ======================
    // 🟢 Buat deployment request baru
    // ======================
    const newRequest = await DeploymentRequest.create({
      releaseId,
      title,
      implementDate,
      applicationId,
      riskImpact,
      attachment: attachmentPath,
      createdByUserId: req.user.userId,
      status: null, // default
      sqiPicId: null, // default
    });

    res.status(201).json({
      message: "✅ Request Deployment berhasil dibuat.",
      data: newRequest,
    });
  } catch (err) {
    console.error("❌ Error creating request deployment:", err);
    res.status(500).json({
      error: "Gagal membuat request deployment.",
      details: err.message,
    });
  }
};

// ======================
// 🔹 GET all Deployment Requests (Developer & SQI bisa lihat)
// ======================
// export const getDeploymentRequests = async (req, res) => {
//   try {
//     const { startDate, endDate, page = 1, limit = 10 } = req.query;

//     // Validasi query date
//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         error: "Harap sertakan startDate dan endDate di query params.",
//       });
//     }

//     const offset = (parseInt(page) - 1) * parseInt(limit);

//     // Hitung total data
//     const totalRequests = await DeploymentRequest.count({
//       where: {
//         implementDate: {
//           [Op.between]: [startDate, endDate],
//         },
//       },
//     });

//     // Ambil data sesuai pagination
//     const requests = await DeploymentRequest.findAll({
//       where: {
//         implementDate: {
//           [Op.between]: [startDate, endDate],
//         },
//       },
//       include: [
//         {
//           model: Application,
//           as: "application",
//           attributes: ["id", "name"],
//         },
//       ],
//       order: [["implementDate", "ASC"]],
//       limit: parseInt(limit),
//       offset,
//     });

//     res.json({
//       message: "✅ Data request deployment berhasil dimuat.",
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(totalRequests / parseInt(limit)),
//       totalData: totalRequests,
//       count: requests.length,
//       data: requests,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching requests:", err);
//     res.status(500).json({
//       error: "Gagal memuat request deployment.",
//       details: err.message,
//     });
//   }
// };


import fs from "fs";
import path from "path";

// ======================
// 📦 DOWNLOAD ATTACHMENT
// ======================
export const downloadAttachment = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ error: "Nama file tidak ditemukan di parameter." });
    }

    // Pastikan path aman (hindari traversal)
    const filePath = path.join(process.cwd(), "uploads", filename);

    // Periksa apakah file ada
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File tidak ditemukan di server." });
    }

    // Tentukan tipe konten berdasarkan ekstensi
    const extension = path.extname(filename).toLowerCase();
    let mimeType = "application/octet-stream"; // default
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
// 🟡 UPDATE SQI PIC & STATUS Deployment Request
// ======================
export const updateDeploymentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { sqiPicId, status } = req.body;

    const request = await DeploymentRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: "Deployment request tidak ditemukan." });
    }

    // Validasi status (jika ada)
    const validStatuses = [null, "success", "redeploy", "cancel"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status tidak valid." });
    }

    // Update nilai jika dikirim dari frontend
    if (sqiPicId !== undefined) request.sqiPicId = sqiPicId || null;
    if (status !== undefined) request.status = status || null;

    await request.save();

    res.status(200).json({
      message: "✅ Deployment request berhasil diperbarui.",
      data: request,
    });
  } catch (err) {
    console.error("❌ Error updating deployment request:", err);
    res.status(500).json({
      error: "Gagal memperbarui deployment request.",
      details: err.message,
    });
  }
};

