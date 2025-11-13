import SQIPic from "../models/SQIPic.js";

/**
 * Ambil semua data PIC SQI
 */
export const getAllSQIPics = async (req, res) => {
  try {
    const sqiPics = await SQIPic.findAll();
    res.status(200).json({
      message: "Daftar PIC SQI berhasil diambil.",
      data: sqiPics,
    });
  } catch (err) {
    console.error("Error fetching SQI PICs:", err);
    res.status(500).json({ error: "Failed to retrieve SQI PIC list." });
  }
};

/**
 * Tambah PIC SQI baru
 */
// export const createSQIPic = async (req, res) => {
//   try {
//     const { name, email } = req.body;

//     if (!name || !email) {
//       return res.status(400).json({
//         error: "The 'name' and 'email' fields are required.",
//       });
//     }

//     const newPic = await SQIPic.create({ name, email });
//     res.status(201).json({
//       message: "PIC SQI added successfully.",
//       data: newPic,
//     });
//   } catch (err) {
//     console.error("Error creating SQI PIC:", err);
//     res.status(500).json({ error: "Failed to add PIC SQI." });
//   }
// };
