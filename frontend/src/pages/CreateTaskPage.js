import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { useNavigate } from "react-router-dom";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const CreateTaskPage = () => {
  const [supportTypes, setSupportTypes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [sqiPics, setSqiPics] = useState([]);
  const [form, setForm] = useState({
    title: "",
    supportType: "",
    customSupportType: "",
    description: "",
    applicationId: "",
    sqiPicId: "",
    attachment: null,
  });

  // 🔹 Tambahkan state untuk Snackbar
  const [alertType, setAlertType] = useState("success"); // 'success' | 'error'
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supportRes, appRes, picRes] = await Promise.all([
          axios.get("http://localhost:4000/api/support-types", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get("http://localhost:4000/api/applications", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get("http://localhost:4000/api/sqi-pics", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);

        setSupportTypes(supportRes.data?.data || []);
        setApplications(appRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
      }
    };

    fetchData();
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
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("supportType", form.supportType);
    formData.append(
      "customSupportType",
      form.supportType === "Other" ? form.customSupportType : null
    );
    formData.append("applicationId", form.applicationId);
    formData.append("sqiPicId", form.sqiPicId);

    if (form.attachment) {
      formData.append("attachment", form.attachment);
    }

    try {
      await axios.post("http://localhost:4000/api/tasks", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/task-list", {
        state: {
          alert: "Task created successfully!",
          type: "success",
        },
      });
    } catch (err) {
      console.error("Error creating task:", err);

      navigate("/task-list", {
        state: {
          alert: "Failed to save task. Please try again.",
          type: "error",
        },
      });
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
            Request Support SQI
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
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
              select
              label="Support Type"
              name="supportType"
              value={form.supportType}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              required
            >
              {supportTypes.map((type) => (
                <MenuItem key={type.id} value={type.name}>
                  {type.name}
                </MenuItem>
              ))}
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            {form.supportType === "Other" && (
              <TextField
                label="Custom Support Type"
                name="customSupportType"
                value={form.customSupportType}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                required
              />
            )}

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
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 2 }}
              required
            />

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
              sx={{ mb: 2, textTransform: "none" }}
            >
              {form.attachment ? "Change File" : "Select Attachment File"}
              <input type="file" hidden name="attachment" onChange={handleFileChange} />
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
    </Box>
  );
};

export default CreateTaskPage;
