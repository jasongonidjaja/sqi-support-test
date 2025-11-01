import express from "express";
import multer from "multer";  // Import multer
import {
  authenticate,
  authorize
} from "../middleware/auth.js";
import Task from "../models/Task.js";
import Application from "../models/Application.js";
import SQIPic from "../models/SQIPic.js";
import SupportType from "../models/SupportType.js";
import User from "../models/User.js";
import TaskStatus from "../constants/taskStatus.js";
import TaskLog from "../models/TaskLog.js";

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Tentukan folder penyimpanan file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Tentukan nama file
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

/**
 * ===============================
 * 🔐 SQI: Melihat semua task
 * ===============================
 */
router.get("/", authenticate, authorize("sqi", "developer"), async (req, res) => {
  try {
    console.log("✅ Fetch tasks - Authorized user:", req.user);

    const whereCondition =
      req.user.role === "developer"
        ? { createdByUserId: req.user.userId } // hanya task miliknya
        : {}; // SQI: semua task

    const tasks = await Task.findAll({
      where: whereCondition,
      include: [
        { model: Application, as: "application" },
        { model: SQIPic, as: "sqiPic" },
        { model: SupportType, as: "supportType" },
        { model: User, as: "createdBy", attributes: ["id", "username", "role"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Berhasil mengambil data task.",
      count: tasks.length,
      data: tasks.map(task => ({
        ...task.toJSON(),
        status: task.status, // Pastikan status ada di response
      })),
    });
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ error: "Gagal mengambil data task.", details: err.message });
  }
});

// Dapatkan semua PIC SQI
router.get("/sqi-pics", authenticate, authorize("sqi"), async (req, res) => {
  try {
    const sqiPics = await SQIPic.findAll({ attributes: ["id", "name"] });
    res.json(sqiPics);
  } catch (err) {
    console.error("❌ Error fetching SQI PICs:", err);
    res.status(500).json({ error: "Gagal mengambil daftar PIC SQI" });
  }
});

/**
 * ===============================
 * 👨‍💻 Developer: Membuat task baru
 * ===============================
 */
router.post("/", authenticate, authorize("developer"), upload.single("attachment"), async (req, res) => {
  try {
    const {
      title,
      description,
      supportType,
      customSupportType,
      applicationId,
      sqiPicId,
      status = TaskStatus.PENDING, // Default ke 'pending' jika tidak ada status yang diberikan
    } = req.body;

    // Dapatkan path file upload
      const attachmentPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    // Validasi input
    if (!title || !description || !applicationId) {
      return res.status(400).json({
        error: "Field wajib tidak boleh kosong: title, description, applicationId, sqiPicId.",
      });
    }

    // Tentukan supportTypeId (jika bukan custom)
    let supportTypeId = null;
    if (supportType && supportType !== "Other") {
      const existingType = await SupportType.findOne({
        where: {
          name: supportType
        }
      });
      if (existingType) supportTypeId = existingType.id;
    }

    // Buat task baru
    const newTask = await Task.create({
      title,
      description,
      supportTypeId,
      customSupportType: supportType === "Other" ? customSupportType : null,
      applicationId,
      sqiPicId: sqiPicId || null,
      createdByUserId: req.user.userId, // 🔹 user login dari JWT
      attachment: attachmentPath, // Menyimpan path file
      status, // Menambahkan status di sini
      createdAt: new Date(),
      updatedAt: new Date(),
    });

        // 🧾 Simpan log aktivitas
    await TaskLog.create({
      taskId: newTask.id,
      action: "Task Created",
      oldValue: null,
      newValue: status,
      userId: req.user.userId,
    });

    res.status(201).json({
      message: "✅ Task berhasil dibuat.",
      data: newTask,
    });
  } catch (err) {
    console.error("❌ Error creating task:", err);
    res.status(500).json({
      error: "Gagal membuat task.",
      details: err.message,
    });
  }
});

/**
 * ===============================
 * 🔍 (Opsional) SQI & Developer:
 * Melihat 1 task berdasarkan ID
 * ===============================
 */
router.get("/:id", authenticate, authorize("sqi", "developer"), async (req, res) => {
  try {
    const {
      id
    } = req.params;

    const task = await Task.findByPk(id, {
      include: [{
          model: Application,
          as: "application"
        },
        {
          model: SQIPic,
          as: "sqiPic"
        },
        {
          model: SupportType,
          as: "supportType"
        },
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "username", "role"]
        }, // 🔹 Tambahan baru
      ],
    });

    if (!task) {
      return res.status(404).json({
        error: "Task tidak ditemukan."
      });
    }

    res.status(200).json({
      message: "Task ditemukan.",
      data: task
    });
  } catch (err) {
    console.error("❌ Error fetching task by ID:", err);
    res.status(500).json({
      error: "Gagal mengambil data task.",
      details: err.message
    });
  }
});

// src/routes/task.js -> update task status
router.put("/:id", authenticate, authorize("sqi"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Pastikan status yang diberikan valid
    const validStatuses = ["pending", "in_progress", "completed", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Status yang diberikan tidak valid. Status harus salah satu dari: pending, in_progress, completed, approved, rejected."
      });
    }

    // Cari task berdasarkan ID
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        error: "Task tidak ditemukan."
      });
    }

    // Simpan nilai lama status
    const oldStatus = task.status;
    console.log(oldStatus)

    // Update status task
    task.status = status;
    await task.save();

    // Simpan log aktivitas status berubah
    await TaskLog.create({
      taskId: task.id,
      action: "Status Change",
      oldValue: oldStatus,
      newValue: status,
      userId: req.user.userId,
    });

    res.status(200).json({
      message: `Task status berhasil diubah menjadi ${status}.`,
      data: task,
    });
  } catch (err) {
    console.error("❌ Error updating task:", err);
    res.status(500).json({
      error: "Gagal mengubah status task.",
      details: err.message,
    });
  }
});

// SQI (admin) assign PIC SQI ke task
router.put("/:id/assign", authenticate, authorize("sqi"), async (req, res) => {
  try {
    const { id } = req.params;
    const { sqi_pic_id } = req.body;

    if (!sqi_pic_id) {
      return res.status(400).json({ error: "Harap sertakan ID PIC SQI yang akan di-assign." });
    }

    // 🔍 Cari task
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: "Task tidak ditemukan." });
    }

    // Simpan nilai lama PIC SQI
    const oldPic = task.sqiPicId;

    // 🔍 Cari PIC SQI dari tabel sqi_pics
    const sqiPic = await SQIPic.findByPk(sqi_pic_id);
    if (!sqiPic) {
      return res.status(404).json({ error: "PIC SQI tidak ditemukan di database sqi_pics." });
    }

    // 🟢 Assign ke kolom model yang benar
    task.sqiPicId = sqi_pic_id;

    // ⚙️ Ubah status otomatis jika masih "pending"
    if (task.status === "pending") {
      task.status = "in_progress";
    }

    await task.save();

    // Simpan log aktivitas assign PIC SQI
    await TaskLog.create({
      taskId: task.id,
      action: "PIC Assigned",
      oldValue: oldPic ? `PIC ID: ${oldPic}` : "None", // Old PIC (atau 'None' jika belum ada)
      newValue: `PIC ID: ${sqi_pic_id}`, // New PIC
      userId: req.user.userId,
    });

    // (Opsional) Ambil ulang dengan relasi lengkap
    const updatedTask = await Task.findByPk(id, {
      include: [
        { model: SQIPic, as: "sqiPic", attributes: ["id", "name"] },
        { model: User, as: "createdBy", attributes: ["id", "username", "role"] },
      ],
    });

    res.status(200).json({
      message: `✅ Task berhasil di-assign ke PIC SQI: ${sqiPic.name}, status otomatis menjadi "${task.status}".`,
      data: updatedTask,
    });
  } catch (err) {
    console.error("❌ Error assigning PIC SQI:", err);
    res.status(500).json({
      error: "Gagal assign PIC SQI.",
      details: err.message,
    });
  }
});


export default router;