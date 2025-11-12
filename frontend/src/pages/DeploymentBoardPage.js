import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Pagination,
  Grid,
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

const riskOrder = {
  "Major Release": 1,
  "High": 2,
  "Medium": 3,
  "Low": 4,
};

// 🔹 Format tanggal tampilan (Senin, 11 Nov)
const formatDate = (date) =>
  new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

// 🔹 Hitung awal minggu (Senin)
const getWeekStart = (date) => {
  if (!date || isNaN(new Date(date))) return new Date();
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const DeploymentBoardPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);

  // Popup states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statuses] = useState(["null", "success", "redeploy", "cancel"]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sqiPics, setSqiPics] = useState([]);
  const [selectedPic, setSelectedPic] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.toLowerCase() || "guest";


  // 🔹 Fetch data dari endpoint /calendar dan /sqi-pics
  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const res = await api.get("/calendar");
        const rawData = res.data?.data || [];

        console.log("📦 Data mentah dari /calendar:", rawData);

        const cleaned = rawData
          .map((item) => {
            const dateField =
              item.implementDate || item.supportDate || item.date;
            const parsedDate = new Date(dateField);
            if (isNaN(parsedDate)) return null;
            return {
              ...item,
              date: parsedDate,
            };
          })
          .filter((e) => e !== null);

        setEvents(cleaned);
      } catch (err) {
        console.error("❌ Gagal mengambil data calendar:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSqiPics = async () => {
      try {
        const res = await api.get("/sqi-pics");
        setSqiPics(res.data?.data || []);
      } catch (err) {
        console.error("❌ Gagal mengambil data SQI PIC:", err);
      }
    };

    fetchCalendar();
    fetchSqiPics();
  }, []);

  // 🔹 Klik Card → buka dialog
  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setSelectedStatus(event.status || "null");
    setSelectedPic(event.sqiPicId || "");
    setOpenDialog(true);
  };

  // 🔹 Download attachment
  const handleDownload = async () => {
    try {
      if (!selectedEvent?.attachment) return;
      const filename = selectedEvent.attachment.split("/").pop();
      const response = await api.get(`/deployment-requests/download/${filename}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Gagal mengunduh file:", err);
      alert("Gagal mengunduh file.");
    }
  };

  // 🔹 Ganti status
  const handleStatusChange = async (event) => {
    if (isUpdating) return;
    setIsUpdating(true);
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);

    try {
      await api.patch(`/deployment-requests/${selectedEvent.id}`, {
        status: newStatus === "null" ? null : newStatus,
      });
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

  // 🔹 Assign SQI PIC
  const handleAssignPic = async (event) => {
    if (isUpdating) return;
    setIsUpdating(true);
    const picId = event.target.value;
    setSelectedPic(picId);

    try {
      await api.patch(`/deployment-requests/${selectedEvent.id}`, {
        sqiPicId: picId === "" ? null : picId,
      });
      setSelectedEvent((prev) => ({
        ...prev,
        sqiPicId: picId === "" ? null : picId,
      }));
      alert("PIC berhasil di-assign!");
    } catch (err) {
      console.error("❌ Gagal assign PIC:", err);
      alert("Gagal assign PIC.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );

  // 🔹 Kelompokkan berdasarkan minggu dan hari
  const eventsByWeek = {};
  events.forEach((event) => {
    const weekStart = getWeekStart(event.date).toISOString().split("T")[0];
    if (!eventsByWeek[weekStart]) eventsByWeek[weekStart] = {};
    const dateStr = event.date.toISOString().split("T")[0];
    if (!eventsByWeek[weekStart][dateStr]) eventsByWeek[weekStart][dateStr] = [];
    eventsByWeek[weekStart][dateStr].push(event);
  });

  const weekKeys = Object.keys(eventsByWeek).sort();
  const currentWeekKey = weekKeys[currentWeek] || weekKeys[0];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekKey);
    d.setDate(d.getDate() + i);
    return d;
  });

  const riskColor = (event) => {
    switch (event.riskImpact) {
      case "Low":
        return "#A5D6A7";
      case "Medium":
        return "#FFF59D";
      case "High":
        return "#EF9A9A";
      case "Major Release":
        return "#3a3a3a";
      default:
        return "#E0E0E0";
    }
  };

  return (
    <Box sx={{ px: 2, pb: 5 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ color: "#1976d2", mb: 3, textAlign: "center" }}>
        Deployment Board
      </Typography>

      {[0, 4].map((startIdx, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 2, mb: 3 }}
        >
          {weekDays.slice(startIdx, startIdx + (rowIndex === 0 ? 4 : 3)).map((day) => {
            const dateStr = day.toISOString().split("T")[0];
            const eventsToday = eventsByWeek[currentWeekKey]?.[dateStr] || [];
            const requests = eventsToday.filter((e) => e.type === "request");
            const supports = eventsToday.filter((e) => e.type === "support");

            return (
              <Paper
                key={dateStr}
                sx={{
                  p: 2,
                  width: 280,
                  backgroundColor: "#f9f9f9",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: "#1976d2" }}>
                  {formatDate(day)}
                </Typography>

                <Grid container spacing={1}>
                  <Grid item xs={6} sx={{ pr: 1, borderRight: "1px solid #ddd" }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
                      Request
                    </Typography>
                    {requests.length === 0 ? (
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        (Kosong)
                      </Typography>
                    ) : (
                      requests
                        .sort((a, b) => (riskOrder[a.riskImpact] || 99) - (riskOrder[b.riskImpact] || 99))
                        .map((event) => (

                        <Card
                          key={event.id}
                          sx={{
                            mb: 1,
                            backgroundColor: riskColor(event),
                            cursor: "pointer",
                          }}
                          onClick={() => handleCardClick(event)}
                        >
                          <CardContent
                            sx={{
                              px: 1,
                              py: 0,
                              "&:last-child": { pb: 0 },
                              height: 48,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold" noWrap sx={{ width: "100%" }}>
                              {event.title}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Grid>

                  <Grid item xs={6} sx={{ pl: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
                      Support
                    </Typography>
                    {supports.length === 0 ? (
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        (Kosong)
                      </Typography>
                    ) : (
                      supports
                        .sort((a, b) => (riskOrder[a.riskImpact] || 99) - (riskOrder[b.riskImpact] || 99))
                        .map((event) => (

                        <Card
                          key={event.id}
                          sx={{
                            mb: 1,
                            backgroundColor: riskColor(event),
                            cursor: "pointer",
                          }}
                          onClick={() => handleCardClick(event)}
                        >
                          <CardContent
                            sx={{
                              px: 1,
                              py: 0,
                              "&:last-child": { pb: 0 },
                              height: 48,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold" noWrap sx={{ width: "100%" }}>
                              {event.title}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Box>
      ))}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination
          count={weekKeys.length}
          page={currentWeek + 1}
          onChange={(e, val) => setCurrentWeek(val - 1)}
          color="primary"
        />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Detail Event</DialogTitle>
        <DialogContent dividers>
          {selectedEvent ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography>
                <strong>Judul:</strong> {selectedEvent.title}
              </Typography>
              <Typography>
                <strong>Tipe:</strong> {selectedEvent.type}
              </Typography>
              <Typography>
                <strong>Tanggal:</strong>{" "}
                {selectedEvent.implementDate || selectedEvent.supportDate}
              </Typography>
              <Typography>
                <strong>Risk Impact:</strong> {selectedEvent.riskImpact || "-"}
              </Typography>

              {/* 🔹 SQI bisa assign PIC */}
              {role === "sqi" && selectedEvent?.type === "request" && (
                <FormControl size="small" sx={{ mt: 1, width: "100%" }}>
                  <InputLabel id="sqi-pic-label">Assign SQI PIC</InputLabel>
                  <Select
                    labelId="sqi-pic-label"
                    value={selectedPic}
                    onChange={handleAssignPic}
                    label="Assign SQI PIC"
                  >
                    {sqiPics.map((pic) => (
                      <MenuItem key={pic.id} value={pic.id}>
                        {pic.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* 🔹 Developer hanya bisa lihat PIC */}
              {role === "developer" && (
                <Typography sx={{ mt: 1 }}>
                  <strong>PIC SQI:</strong>{" "}
                  {sqiPics.find((p) => p.id === selectedEvent.sqiPicId)?.name || "-"}
                </Typography>
              )}

              {/* 🔹 SQI bisa ubah status */}
              {role === "sqi" && selectedEvent?.type === "request" && (
                <FormControl size="small" sx={{ mt: 2, width: "100%" }}>
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

              {/* 🔹 Developer hanya lihat status */}
              {role === "developer" && (
                <Typography sx={{ mt: 1 }}>
                  <strong>Status:</strong> {selectedEvent.status || "-"}
                </Typography>
              )}
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
    >
      Download
    </Button>
  )}

  <Button onClick={() => setOpenDialog(false)} color="primary">
    Tutup
  </Button>
</DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeploymentBoardPage;
