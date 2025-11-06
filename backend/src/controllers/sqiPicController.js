// src/controllers/sqiPicController.js
import SQIPic from "../models/SQIPic.js";

/**
 * 🔹 Ambil semua data PIC SQI
 */
export const getAllSQIPics = async (req, res) => {
  try {
    const sqiPics = await SQIPic.findAll();
    res.status(200).json({
      message: "Daftar PIC SQI berhasil diambil.",
      data: sqiPics,
    });
  } catch (err) {
    console.error("❌ Error fetching SQI PICs:", err);
    res.status(500).json({ error: "Gagal mengambil daftar PIC SQI." });
  }
};

/**
 * 🔹 Tambah PIC SQI baru
 */
export const createSQIPic = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "Field 'name' dan 'email' wajib diisi.",
      });
    }

    const newPic = await SQIPic.create({ name, email });
    res.status(201).json({
      message: "PIC SQI berhasil ditambahkan.",
      data: newPic,
    });
  } catch (err) {
    console.error("❌ Error creating SQI PIC:", err);
    res.status(500).json({ error: "Gagal menambahkan PIC SQI." });
  }
};
