import asyncHandler from "express-async-handler";
import SupportType from "../models/SupportType.js";

// ✅ Ambil semua Support Type
export const getAllSupportTypes = asyncHandler(async (req, res) => {
  const types = await SupportType.findAll();
  res.status(200).json({
    message: "✅ Berhasil mengambil data support types.",
    data: types,
  });
});

// ✅ Tambah Support Type baru (opsional)
export const createSupportType = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Nama support type harus diisi." });
  }

  const newType = await SupportType.create({ name });

  res.status(201).json({
    message: "✅ Support type berhasil dibuat.",
    data: newType,
  });
});
