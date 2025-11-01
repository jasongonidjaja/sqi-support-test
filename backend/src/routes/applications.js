import express from "express";
import Application from "../models/Application.js"; // gunakan default import

const router = express.Router();

// ✅ Ambil semua aplikasi
router.get("/", async (req, res) => {
  try {
    const applications = await Application.findAll();
    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// ✅ Tambah aplikasi baru
router.post("/", async (req, res) => {
  try {
    const { name, owner } = req.body;
    const newApp = await Application.create({ name, owner });
    res.status(201).json(newApp);
  } catch (err) {
    console.error("Error creating application:", err);
    res.status(500).json({ error: "Failed to create application" });
  }
});

export default router;
