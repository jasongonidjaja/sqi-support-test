import asyncHandler from "express-async-handler";
import SupportType from "../models/SupportType.js";

// Ambil semua Support Type
export const getAllSupportTypes = asyncHandler(async (req, res) => {
  const types = await SupportType.findAll();
  res.status(200).json({
    message: "Successfully retrieved support types data.",
    data: types,
  });
});

// Tambah Support Type baru
// export const createSupportType = asyncHandler(async (req, res) => {
//   const { name } = req.body;

//   if (!name) {
//     return res.status(400).json({ error: "The support type name must be filled in." });
//   }

//   const newType = await SupportType.create({ name });

//   res.status(201).json({
//     message: "Support type successfully created.",
//     data: newType,
//   });
// });
