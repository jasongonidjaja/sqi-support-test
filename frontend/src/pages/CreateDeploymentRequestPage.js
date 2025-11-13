import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, MenuItem, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const CreateDeploymentRequestPage = () => {
  const [form, setForm] = useState({
    releaseId: "",
    title: "",
    implementDate: "",
    applicationId: "",
    riskImpact: "Low",
    attachment: null,
  });

  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();

  // Ambil data aplikasi dari API
useEffect(() => {
  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Pastikan applications selalu array
      setApplications(res.data?.data || []);
    } catch (err) {
      console.error("❌ Failed to retrieve application data:", err);
    }
  };

  fetchApplications();
}, []);



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, attachment: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("releaseId", form.releaseId);
    formData.append("title", form.title);
    formData.append("implementDate", form.implementDate);
    formData.append("applicationId", form.applicationId);
    formData.append("riskImpact", form.riskImpact);

    if (form.attachment) {
      formData.append("attachment", form.attachment);
    }

    try {
      // Mengirim request ke backend untuk menyimpan deployment request
      await api.post("/deployment-requests", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Deployment request created successfully!");
      navigate("/deployment-board"); // Redirect ke kalender deployment setelah berhasil
    } catch (err) {
      console.error("❌ Failed to create deployment request:", err);
      alert("Failed to save deployment request.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      {/* Konten utama */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
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
            Request Deployment
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Release ID"
              name="releaseId"
              value={form.releaseId}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              required
            />

            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              required
            />

            <TextField
              label="Select Date"
              name="implementDate"
              type="date"
              value={form.implementDate}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              required
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date().toISOString().split("T")[0], // 🚫 tidak boleh kurang dari hari ini
              }}
            />

            <TextField
              select
              label="Application"
              name="applicationId"
              value={form.applicationId}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              required
            >
              {applications.map((app) => (
                <MenuItem key={app.id} value={app.id}>
                  {app.name}
                </MenuItem>
              ))}
            </TextField>

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

            {/* Upload File */}
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
              sx={{
                mb: 2,
                textTransform: "none",
              }}
            >
              {form.attachment ? "Change File" : "Select Attachment File"}
              <input
                type="file"
                hidden
                name="attachment"
                onChange={handleFileChange}
              />
            </Button>

            {/* Tampilkan nama file jika sudah dipilih */}
            {form.attachment && (
              <Typography
                variant="body2"
                sx={{ mb: 2, color: "text.secondary", fontStyle: "italic" }}
              >
                📄 {form.attachment.name}
              </Typography>
            )}

            <Button variant="contained" fullWidth type="submit">
              Save
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateDeploymentRequestPage;
