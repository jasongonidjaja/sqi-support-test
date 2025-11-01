import multer from "multer";
import path from "path";

// Atur lokasi penyimpanan file dan ekstensi yang diizinkan
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Tentukan folder penyimpanan file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
  },
});

// Filter file yang diizinkan, hanya Excel yang diperbolehkan
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".xlsx" && ext !== ".xls") {
    return cb(new Error("Hanya file Excel yang diperbolehkan"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

export default upload;
