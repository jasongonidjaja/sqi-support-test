import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const DeploymentSupportCalendarPage = () => {
  const [deploymentSupports, setDeploymentSupports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statuses] = useState(["null", "Low", "Medium", "High"]); // contoh status
  const [selectedStatus, setSelectedStatus] = useState("");

  const role = "SQI"; // simulasi role

  const handleEventClick = (info) => {
    const { id, title, extendedProps } = info.event;
    setSelectedEvent({
      id,
      title,
      implementDate: extendedProps.implementDate,
      applicationName: extendedProps.applicationName,
      riskImpact: extendedProps.riskImpact,
      attachment: extendedProps.attachment,
      status: extendedProps.status || "null",
    });
    setSelectedStatus(extendedProps.status || "null");
    setOpenDialog(true);
  };

  const fetchDeploymentSupports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/deployment-supports", {
        params: {
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split("T")[0],
        },
      });
      setDeploymentSupports(res.data?.data || res.data || []);
    } catch (err) {
      console.error("❌ Gagal mengambil data deployment supports:", err);
      setDeploymentSupports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeploymentSupports();
  }, []);

  const calendarEvents = (deploymentSupports || []).map((support) => ({
    id: support.id,
    title: `${support.title} - ${support.riskImpact}`,
    date: support.implementDate,
    implementDate: support.implementDate,
    applicationName: support.application || "Unknown",
    riskImpact: support.riskImpact,
    attachment: support.attachment,
    status: support.status,
    backgroundColor:
      support.riskImpact === "Low"
        ? "#A5D6A7"
        : support.riskImpact === "Medium"
        ? "#FFF59D"
        : support.riskImpact === "High"
        ? "#EF9A9A"
        : "#E0E0E0",
    textColor: "#000000",
  }));

  const handleDownload = async () => {
    try {
      if (!selectedEvent?.attachment) return;
      const filename = selectedEvent.attachment.split("/").pop();
      const response = await api.get(`/deployment-supports/download/${filename}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("❌ Gagal mengunduh file:", err);
      alert("Gagal mengunduh file.");
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (event) => {
    if (isUpdating) return;
    setIsUpdating(true);
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);

    try {
      await api.patch(`/deployment-supports/${selectedEvent.id}`, {
        status: newStatus === "null" ? null : newStatus,
      });
      await fetchDeploymentSupports();
      setSelectedEvent((prev) => ({
        ...prev,
        status: newStatus === "null" ? null : newStatus,
      }));
      alert("Status berhasil diperbarui!");
    } catch (err) {
      console.error("❌ Gagal memperbarui status:", err);
      alert("Gagal memperbarui status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          marginLeft: "220px",
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: "220px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#1976d2", mb: 3 }}>
          Kalender Deployment Support
        </Typography>

        <Paper elevation={3} sx={{ width: "90%", maxWidth: 900, p: 2, borderRadius: 2 }}>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height="80vh"
            events={calendarEvents}
            eventDisplay="block"
            eventClick={handleEventClick}
            eventDidMount={(info) => {
              info.el.style.padding = "4px 6px";
              info.el.style.borderRadius = "4px";
              info.el.style.fontWeight = "600";
              info.el.style.textAlign = "center";
            }}
          />

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
            <DialogTitle>Detail Deployment Support</DialogTitle>
            <DialogContent dividers>
              {selectedEvent ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography>
                    <strong>Judul:</strong> {selectedEvent.title}
                  </Typography>
                  <Typography>
                    <strong>Aplikasi:</strong> {selectedEvent.applicationName}
                  </Typography>
                  <Typography>
                    <strong>Tanggal Implementasi:</strong> {selectedEvent.implementDate}
                  </Typography>
                  <Typography>
                    <strong>Risk Impact:</strong> {selectedEvent.riskImpact}
                  </Typography>
                </Box>
              ) : (
                <Typography>Tidak ada data.</Typography>
              )}
            </DialogContent>

            <DialogActions>
              {selectedEvent?.attachment && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  sx={{ textTransform: "none", fontWeight: 500 }}
                >
                  Download
                </Button>
              )}

              {role === "SQI" && (
                <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    label="Status"
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status === "null" ? "-" : status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button onClick={() => setOpenDialog(false)} color="primary">
                Tutup
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </Box>
  );
};

export default DeploymentSupportCalendarPage;
