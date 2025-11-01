// src/controllers/DeploymentRequestController.js
import DeploymentRequest from "../models/DeploymentRequest.js";
import { Op } from "sequelize";

// Membuat request deployment baru
export const createDeploymentRequest = async (req, res) => {
  const { releaseId, title, implementDate, applicationName, riskImpact } = req.body;
  const attachmentPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

  try {
    const newDeploymentRequest = await DeploymentRequest.create({
      releaseId,
      title,
      implementDate,
      applicationName,
      riskImpact,
      attachment: attachmentPath,
    });

    res.status(201).json({
      message: "Request Deployment berhasil dibuat.",
      data: newDeploymentRequest,
    });
  } catch (err) {
    console.error("Error creating deployment request:", err);
    res.status(500).json({ error: "Gagal membuat request deployment.", details: err.message });
  }
};

// Mendapatkan request deployment berdasarkan bulan atau 7 hari kerja
export const getDeploymentRequests = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const deploymentRequests = await DeploymentRequest.findAll({
      where: {
        implementDate: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate),
        },
      },
      order: [["implementDate", "ASC"]],
    });

    res.status(200).json({
      message: "Data request deployment berhasil diambil.",
      data: deploymentRequests,
    });
  } catch (err) {
    console.error("Error fetching deployment requests:", err);
    res.status(500).json({ error: "Gagal mengambil data request deployment.", details: err.message });
  }
};
