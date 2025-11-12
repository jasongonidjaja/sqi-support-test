import express from "express";
import {
  getAllKnowledge,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
} from "../controllers/knowledgeCenterController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Semua role bisa CRUD
router.get("/", authenticate, getAllKnowledge);
router.post("/", authenticate, createKnowledge);
router.put("/:id", authenticate, updateKnowledge);
router.delete("/:id", authenticate, deleteKnowledge);

export default router;
