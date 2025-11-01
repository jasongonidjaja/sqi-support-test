import express from "express";
import path from "path";
import dotenv from "dotenv";
import supportTypeRoutes from "./routes/supportTypes.js";
import sqiPicRoutes from "./routes/sqiPics.js"; // ✅ pakai import, bukan require
import sequelize from "./config/database.js";   // ✅ tambahkan ini untuk koneksi DB
import applicationRoutes from "./routes/applications.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import deploymentRequestRoutes from "./routes/deploymentRequests.js";

dotenv.config();

const app = express();
import cors from "cors";

// setelah inisialisasi app
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(
  cors({
    origin: "http://localhost:3000", // izinkan React frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Cek server berjalan
app.get("/", (req, res) => {
  res.send("SQI Support System API Running ✅");
});

// Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/support-types", supportTypeRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/sqi-pics", sqiPicRoutes); // ✅ ganti require → import
app.use("/api/deployment-requests", deploymentRequestRoutes);

app.use("/api/auth", authRoutes);


// Jalankan server
const PORT = process.env.PORT || 4000;

sequelize
  .sync({ })
  .then(() => {
    console.log("Database connected and synced");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB Error:", err));
