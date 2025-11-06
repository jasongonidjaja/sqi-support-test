import asyncHandler from "../middleware/asyncHandler.js";
import Task from "../models/Task.js";
import Application from "../models/Application.js";
import SQIPic from "../models/SQIPic.js";
import SupportType from "../models/SupportType.js";
import User from "../models/User.js";
import TaskLog from "../models/TaskLog.js";
import TaskStatus from "../constants/taskStatus.js";

/* ===============================
   📄 GET semua task
   =============================== */
export const getTasks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;       // halaman aktif
  const limit = parseInt(req.query.limit) || 10;    // jumlah data per halaman
  const offset = (page - 1) * limit;

  const whereCondition =
    req.user.role === "developer"
      ? { createdByUserId: req.user.userId }
      : {};

  // Gunakan findAndCountAll untuk pagination
  const { count, rows: tasks } = await Task.findAndCountAll({
    where: whereCondition,
    include: [
      { model: Application, as: "taskApplication" },
      { model: SQIPic, as: "sqiPic" },
      { model: SupportType, as: "supportType" },
      { model: User, as: "createdBy", attributes: ["id", "username", "role"] },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  res.status(200).json({
    message: "✅ Berhasil mengambil data task.",
    totalData: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    perPage: limit,
    data: tasks,
  });
});

/* ===============================
   👨‍💻 POST buat task baru
   =============================== */
export const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    supportType,
    customSupportType,
    applicationId,
    sqiPicId,
    status = TaskStatus.PENDING,
  } = req.body;

  if (!title || !description || !applicationId) {
    const error = new Error("Field wajib tidak boleh kosong: title, description, applicationId.");
    error.statusCode = 400;
    throw error;
  }

  const attachmentPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

  // Tentukan supportTypeId
  let supportTypeId = null;
  if (supportType && supportType !== "Other") {
    const existingType = await SupportType.findOne({ where: { name: supportType } });
    if (existingType) supportTypeId = existingType.id;
  }

  const newTask = await Task.create({
    title,
    description,
    supportTypeId,
    customSupportType: supportType === "Other" ? customSupportType : null,
    applicationId,
    sqiPicId: sqiPicId || null,
    createdByUserId: req.user.userId,
    attachment: attachmentPath,
    status,
  });

  await TaskLog.create({
    taskId: newTask.id,
    action: "Task Created",
    oldValue: null,
    newValue: status,
    userId: req.user.userId,
  });

  res.status(201).json({ message: "✅ Task berhasil dibuat.", data: newTask });
});

/* ===============================
   🔍 GET task by ID
   =============================== */
export const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findByPk(id, {
    include: [
      { model: Application, as: "taskApplication" },
      { model: SQIPic, as: "sqiPic" },
      { model: SupportType, as: "supportType" },
      { model: User, as: "createdBy", attributes: ["id", "username", "role"] },
    ],
  });

  if (!task) {
    const error = new Error("Task tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  if (req.user.role === "developer" && task.createdByUserId !== req.user.userId) {
    const error = new Error("Anda tidak berhak melihat task ini.");
    error.statusCode = 403;
    throw error;
  }

  res.status(200).json({ message: "✅ Task ditemukan.", data: task });
});

/* ===============================
   🔄 PUT update status (SQI)
   =============================== */
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = Object.values(TaskStatus);
  if (!validStatuses.includes(status)) {
    const error = new Error(`Status tidak valid. Harus salah satu dari: ${validStatuses.join(", ")}.`);
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findByPk(id);
  if (!task) {
    const error = new Error("Task tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = task.status;
  task.status = status;
  await task.save();

  await TaskLog.create({
    taskId: task.id,
    action: "Status Change",
    oldValue: oldStatus,
    newValue: status,
    userId: req.user.userId,
  });

  res.status(200).json({ message: `✅ Status task berhasil diubah menjadi ${status}.`, data: task });
});

/* ===============================
   👨‍💼 PUT assign PIC SQI
   =============================== */
export const assignSqiPic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sqi_pic_id } = req.body;

  if (!sqi_pic_id) {
    const error = new Error("Harap sertakan ID PIC SQI yang akan di-assign.");
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findByPk(id);
  if (!task) {
    const error = new Error("Task tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  const sqiPic = await SQIPic.findByPk(sqi_pic_id);
  if (!sqiPic) {
    const error = new Error("PIC SQI tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  const oldPic = task.sqiPicId;
  task.sqiPicId = sqi_pic_id;
  if (task.status === "pending") task.status = "in_progress";
  await task.save();

  await TaskLog.create({
    taskId: task.id,
    action: "PIC Assigned",
    oldValue: oldPic ? `PIC ID: ${oldPic}` : "None",
    newValue: `PIC ID: ${sqi_pic_id}`,
    userId: req.user.userId,
  });

  res.status(200).json({
    message: `✅ Task berhasil di-assign ke ${sqiPic.name}.`,
    data: task,
  });
});
