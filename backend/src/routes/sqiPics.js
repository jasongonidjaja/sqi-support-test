// src/routes/sqiPics.js
import express from "express";
import SQIPic from "../models/SQIPic.js"; // perhatikan huruf besar kecil!

const router = express.Router();

// ✅ Ambil semua data PIC SQI
router.get("/", async (req, res) => {
  try {
    const sqiPics = await SQIPic.findAll();
    res.json(sqiPics);
  } catch (err) {
    console.error("Error fetching SQI PICs:", err);
    res.status(500).json({ error: "Failed to fetch SQI PICs" });
  }
});

// ✅ Tambah PIC SQI baru (opsional)
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    const newPic = await SQIPic.create({ name, email });
    res.status(201).json(newPic);
  } catch (err) {
    console.error("Error creating SQI PIC:", err);
    res.status(500).json({ error: "Failed to create SQI PIC" });
  }
});

export default router;
