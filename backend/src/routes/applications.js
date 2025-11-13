import express from "express";
import {
  getApplications,
  // createApplication,
} from "../controllers/applicationController.js";

const router = express.Router();

// Rute untuk aplikasi
router.get("/", getApplications);
// router.post("/", createApplication);

export default router;
