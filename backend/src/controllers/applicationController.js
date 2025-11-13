import asyncHandler from "express-async-handler";
import Application from "../models/Application.js";

// Ambil semua aplikasi
export const getApplications = asyncHandler(async (req, res) => {
  const applications = await Application.findAll();
  res.status(200).json({
    message: "Successfully retrieved the application list.",
    data: applications,
  });
});

// Tambah aplikasi baru
// export const createApplication = asyncHandler(async (req, res) => {
//   const { name, owner } = req.body;

//   if (!name || !owner) {
//     return res.status(400).json({ error: "Name and owner are required." });
//   }

//   const newApp = await Application.create({ name, owner });
//   res.status(201).json({
//     message: "New application added successfully.",
//     data: newApp,
//   });
// });
