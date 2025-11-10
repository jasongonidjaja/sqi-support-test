// src/app.js
import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import supportTypeRoutes from "./routes/supportTypes.js";
import sqiPicRoutes from "./routes/sqiPics.js";
import applicationRoutes from "./routes/applications.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import deploymentRequestRoutes from "./routes/deploymentRequests.js";
import deploymentSupportsRoutes from "./routes/deploymentSupports.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// ==========================
// 🔧 MIDDLEWARE
// ==========================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check
app.get("/", (req, res) => {
  res.send("🚀 SQI Support System API Running");
});

// ==========================
// 📦 ROUTES
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/support-types", supportTypeRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/sqi-pics", sqiPicRoutes);
app.use("/api/deployment-requests", deploymentRequestRoutes);
app.use("/api/deployment-supports", deploymentSupportsRoutes);

// ==========================
// 🧱 GLOBAL ERROR HANDLER
// ==========================
app.use(errorHandler);

export default app;
