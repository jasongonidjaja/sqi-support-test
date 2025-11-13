import { Op } from "sequelize";
import FreezeDate from "../models/FreezeDate.js";

/**
 * Middleware untuk memastikan tanggal implementasi
 * tidak jatuh dalam periode freeze.
 */
export const checkFreezeDate = async (req, res, next) => {
  try {
    const { implementDate } = req.body;

    // Pastikan tanggal implementasi dikirim
    if (!implementDate) {
      return res.status(400).json({
        error: "Implementation date is required.",
      });
    }

    const selectedDate = new Date(implementDate);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        error: "Implementation date format is invalid.",
      });
    }

    // Jika user memiliki role admin, bisa bypass freeze
    if (req.user.role === "admin") {
      return next();
    }

    // Cek apakah tanggal implementasi termasuk dalam periode freeze
    const freezeHit = await FreezeDate.findOne({
      where: {
        startDate: { [Op.lte]: selectedDate },
        endDate: { [Op.gte]: selectedDate },
      },
    });

    if (freezeHit) {
      return res.status(400).json({
        error: `Tanggal implementasi jatuh pada periode freeze (${freezeHit.reason}) dari ${freezeHit.startDate.toISOString().split("T")[0]} hingga ${freezeHit.endDate.toISOString().split("T")[0]}.`,
      });
    }

    next(); // lanjut ke controller
  } catch (err) {
    console.error("Error checking freeze date:", err);
    res.status(500).json({
      error: "Internal server error while checking freeze date.",
    });
  }
};
