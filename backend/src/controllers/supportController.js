import { Op } from "sequelize";
import multer from "multer";
import fs from "fs";
import path from "path";
import models from "../models/index.js";
import Log from "../models/Log.js"

const { Support } = models;

// ======================
// File Upload Setup
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
// CREATE Support
// ======================
export const createSupport = async (req, res) => {
  try {
    const { releaseId, application, title, implementDate, impactedApplication, note, riskImpact } = req.body;
    const attachmentPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    // Validasi tanggal implementasi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(implementDate);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ error: "Implementation date format is invalid." });
    }

    if (selectedDate < today) {
      return res.status(400).json({ error: "The implementation date must not be less than today." });
    }

    const newSupport = await Support.create({
      releaseId,
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

    await Log.create({
      username: req.user.username,
      title: newSupport.title,
      action: "Support Created",
      oldValue: null,
      newValue: `Support Created with Release ID: ${newSupport.releaseId}`,
      support_releaseId: newSupport.releaseId,
      support_impactedApp: newSupport.impactedApplication,
    });

    res.status(201).json({
      message: "Support successfully created.",
      data: newSupport,
    });
  } catch (err) {
    console.error("Error creating support:", err);
    res.status(500).json({
      error: "Failed to create support.",
      details: err.message,
    });
  }
};

// ======================
// GET all Deployment Supports, fungsi ini dipindahkan ke calendarController
// ======================
// export const getDeploymentSupports = async (req, res) => {
//   try {
//     const { startDate, endDate, page = 1, limit = 10 } = req.query;

//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         error: "Harap sertakan startDate dan endDate di query params.",
//       });
//     }

//     const offset = (parseInt(page) - 1) * parseInt(limit);

//     // Hitung total data
//     const totalSupports = await DeploymentSupport.count({
//       where: {
//         implementDate: {
//           [Op.between]: [startDate, endDate],
//         },
//       },
//     });

//     // Ambil data sesuai pagination
//     const supports = await DeploymentSupport.findAll({
//       where: {
//         implementDate: {
//           [Op.between]: [startDate, endDate],
//         },
//       },
//       order: [["implementDate", "ASC"]],
//       limit: parseInt(limit),
//       offset,
//     });

//     res.json({
//       message: "✅ Data deployment support berhasil dimuat.",
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(totalSupports / parseInt(limit)),
//       totalData: totalSupports,
//       count: supports.length,
//       data: supports,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching deployment supports:", err);
//     res.status(500).json({
//       error: "Gagal memuat data deployment support.",
//       details: err.message,
//     });
//   }
// };


// ======================
// DOWNLOAD ATTACHMENT
// ======================

export const downloadAttachment = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ error: "File name not found in parameters." });
    }

    const filePath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server." });
    }

    const extension = path.extname(filename).toLowerCase();
    let mimeType = "application/octet-stream";
    if (extension === ".csv") mimeType = "text/csv";
    if (extension === ".xlsx") mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    res.setHeader("Content-Type", mimeType);
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error while sending file:", err);
        res.status(500).json({ error: "Failed to download file." });
      }
    });
  } catch (err) {
    console.error("Error in downloadAttachment:", err);
    res.status(500).json({ error: "An error occurred while downloading the file." });
  }
};
