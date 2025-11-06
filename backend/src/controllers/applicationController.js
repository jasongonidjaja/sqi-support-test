import asyncHandler from "express-async-handler";
import Application from "../models/Application.js";

// ✅ Ambil semua aplikasi
export const getApplications = asyncHandler(async (req, res) => {
  const applications = await Application.findAll();
  res.status(200).json({
    message: "✅ Berhasil mengambil daftar aplikasi.",
    data: applications,
  });
});

// ✅ Tambah aplikasi baru
export const createApplication = asyncHandler(async (req, res) => {
  const { name, owner } = req.body;

  if (!name || !owner) {
    return res.status(400).json({ error: "Name dan owner wajib diisi." });
  }

  const newApp = await Application.create({ name, owner });
  res.status(201).json({
    message: "✅ Aplikasi baru berhasil ditambahkan.",
    data: newApp,
  });
});
