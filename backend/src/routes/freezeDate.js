import express from "express";
import {
  getAllFreezeDates,
  createFreezeDate,
  deleteFreezeDate,
} from "../controllers/freezeDateController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// 🔹 Ambil semua freeze date (akses: semua user)
router.get("/", getAllFreezeDates);

// 🔹 Tambah freeze date (akses: SQI)
router.post("/", authenticate, authorize("sqi"), createFreezeDate);

// 🔹 Hapus freeze date (akses: SQI)
router.delete("/:id", authenticate, authorize("sqi"), deleteFreezeDate);

export default router;
