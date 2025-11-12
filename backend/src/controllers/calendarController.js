import { Op } from "sequelize";
import models from "../models/index.js";

const { DeploymentRequest, DeploymentSupport, Application } = models;

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
          error: "weekStart / weekEnd harus berupa tanggal valid (YYYY-MM-DD)",
        });
      }
      whereClause.implementDate = { [Op.between]: [s, e] };
    }

    const [requests, supports] = await Promise.all([
      DeploymentRequest.findAll({
        where: whereClause,
        include: [
          {
            model: Application,
            as: "application",
            attributes: ["id", "name"],
          },
        ],
        order: [["implementDate", "ASC"]],
      }),
      DeploymentSupport.findAll({
        where: whereClause,
        order: [["implementDate", "ASC"]],
      }),
    ]);

    const mappedRequests = requests.map((r) => ({
      id: r.id,
      releaseId: r.releaseId,
      type: "request",
      title: r.title,
      implementDate: toIsoDate(r.implementDate),
      applicationName: r.application?.name || null,
      riskImpact: r.riskImpact || null,
      attachment: r.attachment || null,
      status: r.status || null,
      sqiPicId: r.sqiPicId || null,
    }));

    const mappedSupports = supports.map((s) => ({
      id: s.id,
      releaseId: s.releaseId,
      type: "support",
      title: s.title,
      implementDate: toIsoDate(s.implementDate),
      applicationName: s.application || s.impactedApplication || null,
      riskImpact: s.riskImpact || null,
      attachment: s.attachment || null,
      status: s.status || null,
      sqiPicId: s.sqiPicId || null,
    }));

    const combined = [...mappedRequests, ...mappedSupports].sort(
      (a, b) => new Date(a.implementDate) - new Date(b.implementDate)
    );

    res.json({
      message: "✅ Calendar data loaded (all dates)",
      total: combined.length,
      count: combined.length,
      data: combined,
    });
  } catch (err) {
    console.error("❌ Error in getCalendarData:", err);
    res.status(500).json({
      error: "Gagal memuat data kalender",
      details: err.message,
    });
  }
};

