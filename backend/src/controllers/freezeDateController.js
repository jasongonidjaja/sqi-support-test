import FreezeDate from "../models/FreezeDate.js";

/**
 * Ambil semua Freeze Date
 */
export const getAllFreezeDates = async (req, res) => {
  try {
    const freezeDates = await FreezeDate.findAll({
      order: [["startDate", "ASC"]],
    });

    const formatted = freezeDates.map(fd => ({
      id: fd.id,
      startDate: fd.startDate ? fd.startDate.toISOString().split("T")[0] : null,
      endDate: fd.endDate ? fd.endDate.toISOString().split("T")[0] : null,
      reason: fd.reason,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching freeze dates:", error);
    res.status(500).json({ error: "Failed to fetch freeze dates" });
  }
};


/**
 * Tambah Freeze Date baru
 */
export const createFreezeDate = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const createdByUserId = req.user.id; // dari JWT middleware

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Field 'startDate' dan 'endDate' wajib diisi." });
    }

    // Validasi tanggal
    if (new Date(endDate) < new Date(startDate)) {
      return res
        .status(400)
        .json({ error: "Tanggal akhir tidak boleh sebelum tanggal awal." });
    }

    // Validasi ENUM
    const validReasons = ["EOM", "EOY", "Cuti Bersama", "Tanggal Cantik", "Others"];
    if (reason && !validReasons.includes(reason)) {
      return res.status(400).json({
        error: `Reason tidak valid. Pilihan: ${validReasons.join(", ")}`,
      });
    }

    const newFreeze = await FreezeDate.create({
      startDate,
      endDate,
      reason: reason || "Others",
      createdByUserId,
    });

    res.status(201).json({
      message: "Freeze date berhasil ditambahkan.",
      data: newFreeze,
    });
  } catch (err) {
    console.error("Error creating freeze date:", err);
    res.status(500).json({ error: "Gagal menambahkan freeze date." });
  }
};

/**
 * Hapus Freeze Date
 */
export const deleteFreezeDate = async (req, res) => {
  try {
    const { id } = req.params;

    const freeze = await FreezeDate.findByPk(id);
    if (!freeze) {
      return res.status(404).json({ error: "Freeze date tidak ditemukan." });
    }

    await freeze.destroy();

    res.status(200).json({ message: "Freeze date berhasil dihapus." });
  } catch (err) {
    console.error("Error deleting freeze date:", err);
    res.status(500).json({ error: "Gagal menghapus freeze date." });
  }
};
