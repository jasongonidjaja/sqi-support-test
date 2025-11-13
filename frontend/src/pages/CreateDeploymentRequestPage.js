import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const token = localStorage.getItem("token"); // atau sesuaikan tempat penyimpanan token login kamu

const CreateDeploymentRequestPage = () => {
  const [form, setForm] = useState({
    releaseId: "",
    title: "",
    implementDate: null,
    applicationId: "",
    riskImpact: "Low",
    attachment: null,
  });

  const [applications, setApplications] = useState([]);
  const [freezeDates, setFreezeDates] = useState([]); // daftar tanggal freeze individual
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();

  // 🔹 Ambil data aplikasi dan freeze date
// 🔹 Ambil data aplikasi dan freeze date
useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [appRes, freezeRes] = await Promise.all([
        api.get("/applications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/freeze-dates", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setApplications(appRes.data?.data || []);

      // ✅ Karena backend return langsung array, bukan { data: [...] }
      const freezeArray = Array.isArray(freezeRes.data) ? freezeRes.data : freezeRes.data.data || [];

      // Buat daftar tanggal harian dari startDate - endDate
      const expandedDates = [];
      freezeArray.forEach((range) => {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          expandedDates.push(d.toLocaleDateString("en-CA"));
        }
      });

      // console.log("🧊 Freeze dates:", freezeArray);
      // console.log("📅 Expanded dates:", expandedDates);

      setFreezeDates(expandedDates);
    } catch (err) {
      console.error("❌ Gagal mengambil data:", err);
    }
  };

  fetchData();
}, []);



// 🔒 Fungsi untuk disable tanggal freeze
const isDateDisabled = (date) => {
  const formatted = date.toLocaleDateString("en-CA");

  const isDisabled = freezeDates.includes(formatted);

  // 🧩 Tambahkan log untuk lihat tanggal yang dicek
  if (isDisabled) {
    console.log(`🚫 ${formatted} termasuk freeze date`);
  }

  return isDisabled;
};


  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, attachment: e.target.files[0] });
  };

  const handleAlertClose = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.implementDate) {
      setAlertType("error");
      setAlertMessage("Tanggal implementasi wajib diisi.");
      setAlertOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("releaseId", form.releaseId);
    formData.append("title", form.title);
    // biar gk geser jadi h-1 tanggalnya
    const d = new Date(form.implementDate);
    const implementDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    formData.append("implementDate", implementDate);
    formData.append("applicationId", form.applicationId);
    formData.append("riskImpact", form.riskImpact);
    if (form.attachment) formData.append("attachment", form.attachment);

    try {
      await api.post("/deployment-requests", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setAlertType("success");
      setAlertMessage("Deployment request created successfully!");
      setAlertOpen(true);
      setTimeout(() => navigate("/deployment-board"), 2000);
    } catch (err) {
      console.error("❌ Failed to create deployment request:", err);
      setAlertType("error");
      setAlertMessage("Failed to save deployment request.");
      setAlertOpen(true);
    }
  };

  // 🔒 Fungsi untuk disable tanggal freeze
  // const isDateDisabled = (date) => {
  //   const formatted = date.toISOString().split("T")[0];
  //   return freezeDates.includes(formatted);
  // };

  return (
    <Box sx={{ display: "flex" }}>
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
        <Paper elevation={3} sx={{ p: 4, width: 400, borderRadius: 2 }}>
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
              onChange={(e) => handleChange("releaseId", e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              required
            />

            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              required
            />

            {/* 📅 Date Picker dengan freeze date disabled */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Implement Date"
                value={form.implementDate}
                onChange={(newValue) => handleChange("implementDate", newValue)}
                shouldDisableDate={isDateDisabled}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    sx: { mb: 2 },
                  },
                }}
              />
            </LocalizationProvider>

            <TextField
              select
              label="Application"
              name="applicationId"
              value={form.applicationId}
              onChange={(e) => handleChange("applicationId", e.target.value)}
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
              onChange={(e) => handleChange("riskImpact", e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Major Release">Major Release</MenuItem>
            </TextField>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
              sx={{ mb: 2, textTransform: "none" }}
            >
              {form.attachment ? "Change File" : "Select Attachment File"}
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
              Save
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertType}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateDeploymentRequestPage;
