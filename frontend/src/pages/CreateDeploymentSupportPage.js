import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const CreateDeploymentSupportPage = () => {
  const [form, setForm] = useState({
    releaseId: "",
    application: "",
    title: "",
    implementDate: "",
    impactedApplication: "",
    note: "",
    attachment: null,
    riskImpact: "Low",
  });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

    const today = new Date();
    const selectedDate = new Date(form.implementDate);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      handleAlert("The implementation date must not be less than today!", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("releaseId", form.releaseId);
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

      handleAlert("Deployment Support successfully created!", "success");

      // delay 2 detik sebelum pindah halaman
      setTimeout(() => navigate("/deployment-board"), 2000);
    } catch (err) {
      console.error("Failed to create Deployment Support:", err);
      handleAlert("Failed to save Deployment Support.", "error");
    }
  };

  const todayDate = new Date().toISOString().split("T")[0];

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

            <TextField
              label="Select Date"
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

        {/* Snackbar Alert */}
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

export default CreateDeploymentSupportPage;
