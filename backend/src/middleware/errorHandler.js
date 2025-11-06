// src/middleware/errorHandler.js

export default function errorHandler(err, req, res, next) {
  console.error("🔥 [ErrorHandler]", err);

  // Tentukan kode status
  const statusCode = err.statusCode || 500;

  // Jika error multer (upload)
  if (err instanceof Error && err.message.includes("multer")) {
    return res.status(400).json({
      status: "error",
      message: "File upload gagal.",
      details: err.message,
    });
  }

  // Format respons error
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
    details: err.details || null,
  });
}
