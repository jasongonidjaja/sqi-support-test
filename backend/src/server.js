// src/server.js
import dotenv from "dotenv";
import fs from "fs";
import app from "./App.js";
import sequelize from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

// Pastikan folder uploads ada
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Folder 'uploads' dibuat otomatis.");
}

// ==========================
// 🗄️ KONEKSI DATABASE & START SERVER
// ==========================
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    // Sync model hanya di development
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: false });
      console.log("🧩 Database synced (development mode)");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
})();
