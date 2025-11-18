import { Op } from "sequelize";
import models from "../models/index.js";
import { application } from "express";

// Mengambil model yang dibutuhkan
const { DeploymentRequest, Support, Application, User } = models;

// Helper function untuk format tanggal menjadi ISO
const toIsoDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d)) return null;
  return d.toISOString().split("T")[0];
};

/**
 * GET /calendar
 * Mengembalikan semua data (tanpa pagination)
 * Query optional: weekStart, weekEnd
 */
export const getCalendarData = async (req, res) => {
  try {
    let { weekStart, weekEnd } = req.query;

    // Jika tidak ada filter, ambil semua data
    const whereClause = {};
    if (weekStart && weekEnd) {
      const s = toIsoDate(weekStart);
      const e = toIsoDate(weekEnd);
      if (!s || !e) {
        return res.status(400).json({
          error: "weekStart / weekEnd must be a valid date (YYYY-MM-DD)",
        });
      }
      whereClause.implementDate = { [Op.between]: [s, e] };
    }

    // Mengambil data DeploymentRequest dan Support secara bersamaan
    const [deployment, supports] = await Promise.all([
      DeploymentRequest.findAll({
        where: whereClause,
        include: [
          {
            model: Application,
            as: "application",
            attributes: ["id", "name"], // Menyertakan nama aplikasi
          },
          {
            model: User,  // Menambahkan relasi ke User untuk mengambil nama pengguna
            as: "createdBy",
            attributes: ["username"],  // Menyertakan kolom name dari User
          },
        ],
        order: [["implementDate", "ASC"]],
      }),
      Support.findAll({
        where: whereClause,
        include: [
          {
            model: User,  // Menambahkan relasi ke User untuk mengambil nama pengguna
            as: "createdBy",
            attributes: ["username"],  // Menyertakan kolom name dari User
          },
        ],
        order: [["implementDate", "ASC"]],
      }),
    ]);

    // Memetakan data DeploymentRequest
    const mappedDeployment = deployment.map((r) => ({
      id: r.id,
      releaseId: r.releaseId,
      type: "deployment",
      title: r.title,
      implementDate: toIsoDate(r.implementDate),
      application: r.application?.name || null,
      riskImpact: r.riskImpact || null,
      attachment: r.attachment || null,
      status: r.status || null,
      sqiPicId: r.sqiPicId || null,
      createdByUserId: r.createdByUserId,
      createdByUserName: r.createdBy?.username || "Unknown User", // Menyertakan nama pengguna
    }));

    // Memetakan data Support
    const mappedSupports = supports.map((s) => ({
      id: s.id,
      releaseId: s.releaseId,
      type: "support",
      title: s.title,
      implementDate: toIsoDate(s.implementDate),
      application: s.application?.name || null,
      impactedApplication: s.impactedApplication || null,
      riskImpact: s.riskImpact || null,
      attachment: s.attachment || null,
      status: s.status || null,
      sqiPicId: s.sqiPicId || null,
      createdByUserId: s.createdByUserId,
      createdByUserName: s.createdBy?.username || "Unknown User", // Menyertakan nama pengguna
      note: s.note || null,
    }));

    // Menggabungkan hasil deployment dan supports, kemudian mengurutkannya
    const combined = [...mappedDeployment, ...mappedSupports].sort(
      (a, b) => new Date(a.implementDate) - new Date(b.implementDate)
    );

    // Mengirimkan hasil ke frontend
    res.json({
      message: "Calendar data loaded (all dates)",
      total: combined.length,
      count: combined.length,
      data: combined,
    });
  } catch (err) {
    console.error("Error in getCalendarData:", err);
    res.status(500).json({
      error: "Failed to load calendar data",
      details: err.message,
    });
  }
};
