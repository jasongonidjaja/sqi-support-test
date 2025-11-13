import express from "express";
import {
  getAllSupportTypes,
  // createSupportType,
} from "../controllers/supportTypeController.js";

const router = express.Router();

// Routes
router.get("/", getAllSupportTypes);
// router.post("/", createSupportType);

export default router;
