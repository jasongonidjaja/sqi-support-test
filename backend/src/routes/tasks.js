import express from "express";
import multer from "multer";
import fs from "fs";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getTasks,
  createTask,
  getTaskById,
  updateTaskStatus,
  assignSqiPic,
} from "../controllers/TaskController.js";

const router = express.Router();

/* Upload Configuration */
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("❌ Hanya file .xlsx atau .csv yang diizinkan."), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/* Routes */
router.get("/", authenticate, authorize("sqi", "developer"), getTasks);
router.get("/:id", authenticate, authorize("sqi", "developer"), getTaskById);
router.post("/", authenticate, authorize("developer"), upload.single("attachment"), createTask);
router.put("/:id", authenticate, authorize("sqi"), updateTaskStatus);
router.put("/:id/assign", authenticate, authorize("sqi"), assignSqiPic);

export default router;
