import { Op } from "sequelize"; // ✅ penting untuk search
import KnowledgeCenter from "../models/KnowledgeCenter.js";

/**
 * 🔹 Ambil semua data Knowledge Center (dengan live search)
 */
export const getAllKnowledge = async (req, res) => {
  try {
    const search = req.query.search || "";

    const knowledge = await KnowledgeCenter.findAll({
      where: search
        ? {
            problem: { [Op.like]: `%${search}%` }, // live search
          }
        : undefined,
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json({
      message: "Data Knowledge Center berhasil diambil.",
      data: knowledge,
    });
  } catch (err) {
    console.error("❌ Error fetching knowledge:", err);
    res.status(500).json({ error: "Gagal mengambil data Knowledge Center." });
  }
};

/**
 * 🔹 Tambah entry baru
 */
export const createKnowledge = async (req, res) => {
  try {
    const { problem, solution } = req.body;
    const createdByUserId = req.user.userId; // pastikan middleware auth ada

    if (!problem || !solution)
      return res
        .status(400)
        .json({ error: "Field 'problem' dan 'solution' wajib diisi." });

    const newEntry = await KnowledgeCenter.create({
      problem,
      solution,
      createdByUserId,
    });

    res
      .status(201)
      .json({ message: "Entry berhasil ditambahkan.", data: newEntry });
  } catch (err) {
    console.error("❌ Error creating knowledge:", err);
    res.status(500).json({ error: "Gagal menambahkan entry." });
  }
};

/**
 * 🔹 Update entry
 */
export const updateKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    const { problem, solution } = req.body;

    if (!problem || !solution)
      return res
        .status(400)
        .json({ error: "Field 'problem' dan 'solution' wajib diisi." });

    const entry = await KnowledgeCenter.findByPk(id);
    if (!entry) return res.status(404).json({ error: "Entry tidak ditemukan." });

    await entry.update({ problem, solution });

    res.status(200).json({ message: "Entry berhasil diperbarui.", data: entry });
  } catch (err) {
    console.error("❌ Error updating knowledge:", err);
    res.status(500).json({ error: "Gagal memperbarui entry." });
  }
};

/**
 * 🔹 Hapus entry
 */
export const deleteKnowledge = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await KnowledgeCenter.findByPk(id);
    if (!entry) return res.status(404).json({ error: "Entry tidak ditemukan." });

    await entry.destroy();
    res.status(200).json({ message: "Entry berhasil dihapus." });
  } catch (err) {
    console.error("❌ Error deleting knowledge:", err);
    res.status(500).json({ error: "Gagal menghapus entry." });
  }
};
