// src/controllers/deploymentRequestController.js
import { Op } from "sequelize";
import multer from "multer";
import models from "../models/index.js";
import Log from "../models/Log.js"

const { DeploymentRequest, Application } = models;

// =================
// File Upload Setup
// =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

/**
 * =========================
 * CREATE Deployment Request
 * =========================
 */
export const createDeploymentRequest = async (req, res) => {
  try {
    const { releaseId, title, implementDate, applicationId, riskImpact } = req.body;
    const attachmentPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    // Validasi tanggal implementasi dasar
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset waktu agar perbandingan adil
    const selectedDate = new Date(implementDate);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        error: "Implementation date format is invalid.",
      });
    }

    if (selectedDate < today) {
      return res.status(400).json({
        error: "The implementation date must not be less than today.",
      });
    }

    // Buat deployment request baru
    const newDeployment = await DeploymentRequest.create({
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

    await Log.create({
      username: req.user.username,
      title: newDeployment.title,
      action: "Deployment Request Created",
      oldValue: null,
      newValue: `Deployment Created with Release ID: ${newDeployment.releaseId}`,
    });

    res.status(201).json({
      message: "Deployment Request created successfully.",
      data: newDeployment,
    });
  } catch (err) {
    console.error("Error creating request deployment:", err);
    res.status(500).json({
      error: "Failed to create deployment request.",
      details: err.message,
    });
  }
};

import fs from "fs";
import path from "path";

// ======================
// DOWNLOAD ATTACHMENT
// ======================
export const downloadAttachment = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ error: "File name not found in parameters." });
    }

    // Pastikan path aman (hindari traversal)
    const filePath = path.join(process.cwd(), "uploads", filename);

    // Periksa apakah file ada
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server." });
    }

    // Tentukan tipe konten berdasarkan ekstensi
    const extension = path.extname(filename).toLowerCase();
    let mimeType = "application/octet-stream"; // default
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

// ======================
// UPDATE SQI PIC & STATUS Deployment Request
// ======================
export const updateDeploymentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { sqiPicId, status } = req.body;

    const deployment = await DeploymentRequest.findByPk(id);
    if (!deployment) {
      return res.status(404).json({ error: "Deployment request not found." });
    }

    // Validasi status
    const validStatuses = [null, "success", "redeploy", "cancel"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status not valid." });
    }

    const logsToCreate = [];

    // ====== LOGIC PERUBAHAN PIC ======
    if (sqiPicId !== undefined) {
      const oldPic = deployment.sqiPicId;
      const newPic = sqiPicId || null;

      if (oldPic !== newPic) {
        logsToCreate.push({
          username: req.user.username,
          title: deployment.title,
          action: "PIC Assigned",
          oldValue: oldPic ? `PIC ID: ${oldPic}` : "None",
          newValue: newPic ? `PIC ID: ${newPic}` : "None",
          deployment_releaseId: deployment.releaseId || null,
        });
      }

      deployment.sqiPicId = newPic;
    }

    // ====== LOGIC PERUBAHAN STATUS ======
    if (status !== undefined) {
      const oldStatus = deployment.status;
      const newStatus = status || null;

      if (oldStatus !== newStatus) {
        logsToCreate.push({
          username: req.user.username,
          title: deployment.title,
          action: "Status Change",
          oldValue: oldStatus || "None",
          newValue: newStatus || "None",
          deployment_releaseId: deployment.releaseId || null,
        });
      }

      deployment.status = newStatus;
    }

    await deployment.save();

    // ====== SIMPAN LOG JIKA ADA ======
    if (logsToCreate.length > 0) {
      await Log.bulkCreate(logsToCreate);
    }

    res.status(200).json({
      message: "Deployment request successfully updated.",
      data: deployment,
    });
  } catch (err) {
    console.error("Error updating deployment request:", err);
    res.status(500).json({
      error: "Failed to update deployment request.",
      details: err.message,
    });
  }
};