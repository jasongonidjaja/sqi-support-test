import { Op } from "sequelize"; // penting untuk search
import KnowledgeCenter from "../models/KnowledgeCenter.js";

/**
 * Ambil semua data Knowledge Center (dengan live search)
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
      message: "Knowledge Center data was successfully retrieved.",
      data: knowledge,
    });
  } catch (err) {
    console.error("Error fetching knowledge:", err);
    res.status(500).json({ error: "Failed to retrieve Knowledge Center data." });
  }
};

/**
 * Tambah entry baru
 */
export const createKnowledge = async (req, res) => {
  try {
    const { problem, solution } = req.body;
    const createdByUserId = req.user.userId; // pastikan middleware auth ada

    if (!problem || !solution)
      return res
        .status(400)
        .json({ error: "The 'problem' and 'solution' fields are mandatory." });

    const newEntry = await KnowledgeCenter.create({
      problem,
      solution,
      createdByUserId,
    });

    res
      .status(201)
      .json({ message: "", data: newEntry });
  } catch (err) {
    console.error("Entry added successfully.", err);
    res.status(500).json({ error: "Failed to add entry." });
  }
};

/**
 * Update entry
 */
export const updateKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    const { problem, solution } = req.body;

    if (!problem || !solution)
      return res
        .status(400)
        .json({ error: "The 'problem' and 'solution' fields are mandatory." });

    const entry = await KnowledgeCenter.findByPk(id);
    if (!entry) return res.status(404).json({ error: "Entry not found." });

    await entry.update({ problem, solution });

    res.status(200).json({ message: "Entry successfully updated.", data: entry });
  } catch (err) {
    console.error("Error updating knowledge:", err);
    res.status(500).json({ error: "Failed to update entry." });
  }
};

/**
 * Hapus entry
 */
export const deleteKnowledge = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await KnowledgeCenter.findByPk(id);
    if (!entry) return res.status(404).json({ error: "Entry not found." });

    await entry.destroy();
    res.status(200).json({ message: "Entry successfully deleted." });
  } catch (err) {
    console.error("Error deleting knowledge:", err);
    res.status(500).json({ error: "Failed to delete entry." });
  }
};
