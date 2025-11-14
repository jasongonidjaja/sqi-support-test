import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const CreateSupportPage = () => {
  const [form, setForm] = useState({
    releaseId: "",
    application: "",
    title: "",
    implementDate: null,
    impactedApplication: "",
    note: "",
    attachment: null,
    riskImpact: "Low",
  });

  const [freezeDates, setFreezeDates] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const navigate = useNavigate();

  // 🧊 Ambil freeze date dari API
  useEffect(() => {
    const fetchFreezeDates = async () => {
      try {
        const token = localStorage.getItem("token");

        const freezeRes = await api.get("/freeze-dates", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const freezeArray = Array.isArray(freezeRes.data)
          ? freezeRes.data
          : freezeRes.data.data || [];

        const expanded = [];
        freezeArray.forEach((range) => {
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            expanded.push(d.toLocaleDateString("en-CA"));
          }
        });

        setFreezeDates(expanded);
      } catch (err) {
        console.error("❌ Failed to fetch freeze dates:", err);
      }
    };

    fetchFreezeDates();
  }, []);

  // 🔒 Disable tanggal freeze
  const isDateDisabled = (date) => {
    const formatted = date.toLocaleDateString("en-CA");
    return freezeDates.includes(formatted);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (value) => {
    setForm({ ...form, implementDate: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, attachment: e.target.files[0] });
  };

  const handleAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCloseAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.implementDate) {
      handleAlert("Implementation date is required!", "warning");
      return;
    }

    // Format tanggal (menghindari minus 1 hari)
    const d = new Date(form.implementDate);
    const implementDate = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // ❌ Tidak boleh freeze date
    if (freezeDates.includes(implementDate)) {
      handleAlert("Selected date is within a freeze period!", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("releaseId", form.releaseId);
    formData.append("application", form.application);
    formData.append("title", form.title);
    formData.append("implementDate", implementDate);
    formData.append("impactedApplication", form.impactedApplication);
    formData.append("note", form.note);
    formData.append("riskImpact", form.riskImpact);

    if (form.attachment) {
      formData.append("attachment", form.attachment);
    }

    try {
      await api.post("/supports", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      handleAlert("Deployment Support successfully created!", "success");
      setTimeout(() => navigate("/deployment-board"), 2000);
    } catch (err) {
      console.error("❌ Failed to create Support:", err);
      handleAlert("Failed to save Support.", "error");
    }
  };

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
            Add Support
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
              label="Application"
              name="application"
              value={form.application}
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

            {/* 📅 DatePicker with Freeze Date Support */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Implement Date"
                value={form.implementDate}
                onChange={handleDateChange}
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
              label="Impacted Application"
              name="impactedApplication"
              value={form.impactedApplication}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              required
            />

            <TextField
              label="Note"
              name="note"
              value={form.note}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 2 }}
            />

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

        <Snackbar
          open={alertOpen}
          autoHideDuration={3000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseAlert}
            severity={alertSeverity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default CreateSupportPage;
