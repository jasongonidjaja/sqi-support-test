// src/routes/sqiPics.js
import express from "express";
import { getAllSQIPics, createSQIPic } from "../controllers/sqiPicController.js";

const router = express.Router();

// 🔹 Ambil semua PIC SQI
router.get("/", getAllSQIPics);

// 🔹 Tambah PIC SQI baru
router.post("/", createSQIPic);

export default router;
