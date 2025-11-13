import { Op } from "sequelize";
import KnowledgeCenter from "../models/KnowledgeCenter.js";
import Application from "../models/Application.js";

/**
 * Ambil semua data Knowledge Center (dengan live search & filter aplikasi)
 */
export const getAllKnowledge = async (req, res) => {
  try {
    const search = req.query.search || "";
    const application = req.query.application || "";

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { problem: { [Op.like]: `%${search}%` } },
        { solution: { [Op.like]: `%${search}%` } },
      ];
    }

    const includeClause = [
      {
        model: Application,
        as: "application",
        attributes: ["id", "name"],
        where: application
          ? { id: application } // filter berdasarkan id (bukan nama)
          : undefined,
      },
    ];

    const knowledge = await KnowledgeCenter.findAll({
      where: whereClause,
      include: includeClause,
      order: [["updatedAt", "DESC"]],
    });

    // Ubah hasil agar lebih ringkas
    const result = knowledge.map((item) => ({
      id: item.id,
      problem: item.problem,
      solution: item.solution,
      applicationId: item.applicationId,
      applicationName: item.application ? item.application.name : null,
      updatedAt: item.updatedAt,
    }));

    res.status(200).json({
      message: "Knowledge Center data retrieved successfully.",
      data: result,
    });
  } catch (err) {
    console.error("Error fetching knowledge:", err);
    res.status(500).json({ error: "Failed to retrieve Knowledge Center data." });
  }
};


/**
 * Tambah entry baru
 */
// POST /api/knowledge-centers
export const createKnowledge = async (req, res) => {
  try {
    const { problem, solution, applicationId } = req.body;

    const knowledge = await KnowledgeCenter.create({
      problem,
      solution,
      applicationId,
      createdByUserId: req.user.userId, // jika kamu ada sistem user login
    });

    res.status(201).json(knowledge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menambahkan knowledge" });
  }
};


/**
 * Update entry
 */
export const updateKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    const { problem, solution } = req.body;

    const entry = await KnowledgeCenter.findByPk(id);
    if (!entry) return res.status(404).json({ error: "Entry not found." });

    await entry.update({ problem, solution });
    res.status(200).json({ message: "Entry updated.", data: entry });
  } catch (err) {
    console.error("Error updating knowledge:", err);
    res.status(500).json({ error: "Failed to update entry." });
  }
};

/**
 * Delete entry
 */
export const deleteKnowledge = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await KnowledgeCenter.findByPk(id);
    if (!entry) return res.status(404).json({ error: "Entry not found." });

    await entry.destroy();
    res.status(200).json({ message: "Entry deleted." });
  } catch (err) {
    console.error("Error deleting knowledge:", err);
    res.status(500).json({ error: "Failed to delete entry." });
  }
};
