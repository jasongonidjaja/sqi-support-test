import express from "express";
import { getCalendarData } from "../controllers/calendarController.js";

const router = express.Router();

// Endpoint utama
router.get("/", getCalendarData);

export default router;
