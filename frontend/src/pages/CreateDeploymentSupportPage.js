import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const CreateDeploymentSupportPage = () => {
  const [form, setForm] = useState({
    application: "",
    title: "",
    implementDate: "",
    impactedApplication: "",
    note: "",
    attachment: null,
    riskImpact: "Low",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, attachment: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔎 Validasi tanggal implementasi tidak boleh kurang dari hari ini
    const today = new Date();
    const selectedDate = new Date(form.implementDate);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("Tanggal implementasi tidak boleh kurang dari hari ini!");
      return;
    }

    const formData = new FormData();
    formData.append("application", form.application);
    formData.append("title", form.title);
    formData.append("implementDate", form.implementDate);
    formData.append("impactedApplication", form.impactedApplication);
    formData.append("note", form.note);
    formData.append("riskImpact", form.riskImpact);

    if (form.attachment) {
      formData.append("attachment", form.attachment);
    }

    try {
      await api.post("/deployment-supports", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Deployment Support berhasil dibuat!");
      navigate("/deployment-board");
    } catch (err) {
      console.error("❌ Gagal membuat Deployment Support:", err);
      alert("Gagal menyimpan Deployment Support.");
    }
  };

  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          // marginLeft: "220px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "transparent",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: 400,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              textAlign: "center",
              color: "#1976d2",
              fontWeight: "bold",
            }}
          >
            Tambah Deployment Support
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Application (free text) */}
            <TextField
              label="Application"
              name="application"
              value={form.application}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              required
              placeholder="Contoh: SQI Support"
            />

            {/* Title */}
            <TextField
              label="Judul Support"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              required
            />

            {/* Implement Date */}
            <TextField
              label="Tanggal Implementasi"
              name="implementDate"
              type="date"
              value={form.implementDate}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: todayDate }}
            />

            {/* Impacted Application */}
            <TextField
              label="Impacted Application"
              name="impactedApplication"
              value={form.impactedApplication}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              required
              placeholder="Contoh: Customer Portal, Internal Dashboard"
            />

            {/* Note */}
            <TextField
              label="Catatan"
              name="note"
              value={form.note}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 2 }}
            />

            {/* Risk Impact */}
            <TextField
              select
              label="Risk Impact"
              name="riskImpact"
              value={form.riskImpact}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Major Release">Major Release</MenuItem>
            </TextField>

            {/* Attachment */}
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
              sx={{ mb: 2, textTransform: "none" }}
            >
              {form.attachment ? "Ganti File" : "Pilih File Attachment"}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>

            {form.attachment && (
              <Typography
                variant="body2"
                sx={{ mb: 2, color: "text.secondary", fontStyle: "italic" }}
              >
                📄 {form.attachment.name}
              </Typography>
            )}

            <Button variant="contained" fullWidth type="submit">
              Simpan Deployment Support
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateDeploymentSupportPage;
