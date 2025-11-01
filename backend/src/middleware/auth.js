import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Fungsi untuk autentikasi (memeriksa token)
export const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Authenticated user:", decoded);
    req.user = decoded; // Menyimpan data user yang terdekode dalam req.user
    next();
  } catch (error) {
    console.error("❌ JWT verify failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Fungsi untuk otorisasi (memeriksa role)
// Fungsi untuk otorisasi (bisa menerima lebih dari satu role)
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Pastikan user sudah terautentikasi
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    // Memeriksa apakah role user termasuk dalam allowedRoles
    if (!allowedRoles.includes(req.user.role)) {
      console.warn(`🚫 Access denied for role: ${req.user.role}`);
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }
    next();
  };
};
