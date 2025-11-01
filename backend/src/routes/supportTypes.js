import express from "express";
import SupportType from "../models/SupportType.js";

const router = express.Router();

// ✅ Ambil semua support types
router.get("/", async (req, res) => {
  try {
    const types = await SupportType.findAll();
    res.json(types);
  } catch (err) {
    console.error("Error fetching support types:", err);
    res.status(500).json({ error: "Failed to fetch support types" });
  }
});

// ✅ Tambah manual (opsional)
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const newType = await SupportType.create({ name });
    res.status(201).json(newType);
  } catch (err) {
    console.error("Error creating support type:", err);
    res.status(500).json({ error: "Failed to create support type" });
  }
});

export default router;
