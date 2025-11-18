import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Typography,
  CircularProgress,
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
import { useLocation } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import timeGridPlugin from "@fullcalendar/timegrid";

const riskColors = {
  "Major Release": "#000000",
  High: "#e53935",
  Medium: "#fdd835",
  Low: "#43a047",
  cancel: "#9e9e9e",
  default: "#90a4ae",
};

// helper: format tanggal jadi YYYY-MM-DD
const toDateString = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d)) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const DeploymentBoardPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statuses] = useState(["null", "success", "redeploy", "cancel"]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sqiPics, setSqiPics] = useState([]);
  const [selectedPic, setSelectedPic] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // buat alert success
  const location = useLocation();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (type, message) => {
  setAlertType(type);
  setAlertMessage(message);
  setAlertOpen(true);
};

  const [users, setUsers] = useState([]);

  // Ambil data pengguna dari API
  const fetchUsers = useCallback(async () => {
    try {
      const userRes = await api.get("/users");
      setUsers(userRes.data);  // Menyimpan data pengguna
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getCreatedByName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.toLowerCase() || "guest";
  const [freezeDates, setFreezeDates] = useState([]);

  // ambil informasi alert dari page sebelumnya
  useEffect(() => {
    if (location.state?.alertMessage) {
      setAlertType(location.state.alertType);
      setAlertMessage(location.state.alertMessage);
      setAlertOpen(true);

      // 🔹 Hapus state supaya tidak repeat saat reload
      window.history.replaceState({}, "");
    }
  }, [location.state]);  


  // Ambil data dari API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [calendarRes, sqiRes, freezeRes] = await Promise.all([
        api.get("/calendar"),
        api.get("/sqi-pics"),
        api.get("/freeze-dates"), // ✅ ambil freeze dates
      ]);

      const freezeData = freezeRes.data || []; // ✅ tambahkan ini
      setFreezeDates(freezeData); // ✅ simpan ke state

      const rawData = calendarRes.data?.data || [];
      const cleaned = rawData
        .map((item) => {
          const dateField = item.implementDate || item.supportDate || item.date;
          if (!dateField) return null;
          const dateStr = toDateString(dateField);
          if (!dateStr) return null;

          return {
            id: item.id,
            title: item.title,
            start: dateStr,
            allDay: true,
            extendedProps: item,
          };
        })
        .filter(Boolean);

      setEvents(cleaned);
      setSqiPics(sqiRes.data?.data || []);
    } catch (err) {
      console.error("❌ Failed to retrieve data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDayCellDidMount = (arg) => {
    const dateStr = toDateString(arg.date);

    const freezeItem = freezeDates.find(fd => {
      const start = new Date(fd.startDate);
      const end = new Date(fd.endDate);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });

    if (freezeItem) {
      arg.el.style.position = "relative";
      arg.el.style.backgroundColor = "rgba(255, 0, 0, 0.12)";
      arg.el.style.border = ""; // default border

      arg.el.innerHTML = ""; // hapus isi

      const reasonText = document.createElement("div");
      reasonText.innerText = freezeItem.reason || "Freeze";
      reasonText.style.position = "absolute";
      reasonText.style.top = "50%";
      reasonText.style.left = "50%";
      reasonText.style.transform = "translate(-50%, -50%)";
      reasonText.style.fontSize = "1rem";
      reasonText.style.fontWeight = "bold";
      reasonText.style.color = "#b71c1c";
      reasonText.style.textAlign = "center";
      reasonText.style.width = "90%";

      arg.el.appendChild(reasonText);
    }
  };

  // Klik event
  const handleEventClick = (clickInfo) => {
    const eventProps = clickInfo.event.extendedProps;
    setSelectedEvent(eventProps);
    setSelectedStatus(eventProps.status || "null");
    setSelectedPic(eventProps.sqiPicId || "");
    setOpenDialog(true);
  };

  // ✅ Tutup dialog dan reload hanya jika role SQI & type event Deployment
  const handleCloseDialog = async () => {
    setOpenDialog(false);

    // Pastikan event dan role cocok
    if (role === "sqi" && selectedEvent?.type === "deployment") {
      await fetchData();
    }
  };

  // 🔹 Update status tanpa reload
  const handleStatusChange = async (event) => {
    if (isUpdating) return;
    setIsUpdating(true);
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);

    try {
      await api.patch(`/deployment-requests/${selectedEvent.id}`, {
        status: newStatus === "null" ? null : newStatus,
      });
      showAlert("success", "Status updated successfully!");
      // ❌ Tidak reload, tidak menutup popup
      setSelectedEvent((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Failed to update status:", err);
      showAlert("error", "Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 🔹 Assign PIC tanpa reload
  const handleAssignPic = async (event) => {
    if (isUpdating) return;
    setIsUpdating(true);
    const picId = event.target.value;
    setSelectedPic(picId);

    try {
      await api.patch(`/deployment-requests/${selectedEvent.id}`, {
        sqiPicId: picId === "" ? null : picId,
      });
      showAlert("success", "PIC assigned successfully!");
      // ❌ Tidak reload, tidak menutup popup
      setSelectedEvent((prev) => ({ ...prev, sqiPicId: picId }));
    } catch (err) {
      console.error("Failed to assign PIC:", err);
      showAlert("error", "Failed to assign PIC.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Download attachment
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
      console.error("Failed to download file:", err);
      alert("Failed to download file.");
    }
  };

  // Custom tampilan per hari
  const dayCellContent = (arg) => {
    const dateStr = toDateString(arg.date);
    const isFreezeDay = freezeDates.some(fd => {
      const start = new Date(fd.startDate);
      const end = new Date(fd.endDate);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });

    const dayEvents = events
      .filter((e) => e.start === dateStr)
      .sort((a, b) => {
        const order = {
          "Major Release": 1,
          High: 2,
          Medium: 3,
          Low: 4,
        };
        const aStatus = a.extendedProps.status || "";
        const bStatus = b.extendedProps.status || "";

        if (aStatus === "cancel" && bStatus !== "cancel") return 1;
        if (bStatus === "cancel" && aStatus !== "cancel") return -1;

        const aRisk = a.extendedProps.riskImpact || "Medium";
        const bRisk = b.extendedProps.riskImpact || "Medium";

        return (order[aRisk] || 999) - (order[bRisk] || 999);
      });

    const deployment = dayEvents.filter((e) => e.extendedProps.type === "deployment");
    const supports = dayEvents.filter((e) => e.extendedProps.type === "support");

    // helper untuk render event
    const renderEvent = (ev) => {
      const color =
        ev.extendedProps.status === "cancel"
          ? riskColors.cancel
          : riskColors[ev.extendedProps.riskImpact] || riskColors.default;

      const textStyle =
        ev.extendedProps.status === "cancel"
          ? { textDecoration: "line-through", color: "#9e9e9e" }
          : { color: "#333" };

      return (
        <div
          key={ev.id}
          onClick={() =>
            handleEventClick({ event: { extendedProps: ev.extendedProps } })
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 500,
            margin: "2px 0",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: color,
              display: "inline-block",
            }}
          />
          <span style={textStyle}>{ev.title}</span>
        </div>
      );
    };

    return (
      <div
        style={{
          padding: "4px",
          borderRadius: "6px",
          minHeight: "80px",
          // backgroundColor: isFreezeDay ? "#ffebee" : "transparent",
          // border: isFreezeDay ? "1px solid #e53935" : "none",
        }}
      >
        {/* Hari dan label freeze */}
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: "bold",
            margin: "4px 0px",
            textAlign: "center",
          }}
        >
          {arg.dayNumberText}
          {/* {isFreezeDay && (
            freezeDates
              .filter(fd => {
                const start = new Date(fd.startDate);
                const end = new Date(fd.endDate);
                const current = new Date(dateStr);
                return current >= start && current <= end;
              })
              .map((fd, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: "0.7rem",
                    color: "#e53935",
                    fontWeight: "bold",
                    lineHeight: "1rem",
                  }}
                >
                  🔒 {fd.reason}
                </div>
              ))
          )} */}

        </div>

        {/* Tampilkan hanya jika ada deployment */}
        {deployment.length > 0 && (
          <div
            style={{
              borderBottom: supports.length > 0 ? "1px solid #e0e0e0" : "none",
              paddingBottom: "4px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#1565c0",
                marginBottom: "2px",
                textAlign: "center",
              }}
            >
              Deployment
            </div>
            {deployment.map(renderEvent)}
          </div>
        )}

        {/* Tampilkan hanya jika ada support */}
        {supports.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#2e7d32",
                marginBottom: "2px",
                textAlign: "center",
              }}
            >
              Support
            </div>
            {supports.map(renderEvent)}
          </div>
        )}
      </div>
    );
  };


  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ px: 2, pb: 5 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{
          color: "#1976d2",
          mb: 3,
          textAlign: "center",
          letterSpacing: "0.5px",
        }}
      >
        Deployment & Support Calendar
      </Typography>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="dayGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
        height="80vh"
        events={events}
        eventClick={handleEventClick}
        dayCellContent={dayCellContent}
        timeZone="local"
        eventDisplay="none"
        className="custom-calendar"
        dayCellDidMount={handleDayCellDidMount}
      />

      {/* 🔹 Legend Warna */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 3,
          mt: 3,
          mb: 4,
        }}
      >
        {Object.entries(riskColors)
          .filter(([key]) => key !== "default")
          .map(([key, color]) => (
            <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: color,
                  border: "1px solid #ccc",
                }}
              />
              <Typography
                variant="body2"
                sx={{ textTransform: "capitalize", fontWeight: 500 }}
              >
                {key}
              </Typography>
            </Box>
          ))}
      </Box>

      {/* Dialog detail */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Event Detail</DialogTitle>
        <DialogContent dividers>
          {selectedEvent ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography>
                <strong>Release ID:</strong> {selectedEvent.releaseId}
              </Typography>
              <Typography>
                <strong>Application:</strong> {selectedEvent.application}
              </Typography>
              <Typography>
                <strong>Title:</strong> {selectedEvent.title}
              </Typography>
              <Typography>
                <strong>Date:</strong>{" "}
                {selectedEvent.implementDate ||
                  selectedEvent.supportDate ||
                  selectedEvent.date}
              </Typography>

              {/* Hanya tampil untuk SUPPORT */}
              {selectedEvent?.type === "support" && (
                <>
                  <Typography>
                    <strong>Impacted Application:</strong>{" "}
                    {selectedEvent.impactedApplication || "-"}
                  </Typography>
                  <Typography>
                    <strong>Note:</strong> {selectedEvent.note || "-"}
                  </Typography>
                </>
              )}

              <Typography>
                <strong>Created By:</strong> {selectedEvent.createdByUserName}
              </Typography>
              <Typography>
                <strong>Risk Impact:</strong> {selectedEvent.riskImpact || "-"}
              </Typography>

              {/* Hanya tampil untuk REQUEST */}
              {selectedEvent?.type === "deployment" && (
                <>
                  {role === "sqi" && (
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

                  {role === "developer" && (
                    <Typography sx={{ mt: 1 }}>
                      <strong>PIC SQI:</strong>{" "}
                      {sqiPics.find((p) => p.id === selectedEvent.sqiPicId)?.name || "-"}
                    </Typography>
                  )}

                  {role === "sqi" && (
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

                  {role === "developer" && (
                    <Typography sx={{ mt: 1 }}>
                      <strong>Status:</strong> {selectedEvent.status || "-"}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          ) : (
            <Typography>No Data.</Typography>
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
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
        <Alert
          severity={alertType}
          variant="filled"
          onClose={() => setAlertOpen(false)}
        >
          {alertMessage}
        </Alert>
      </Snackbar>      
    </Box>
  );
};

export default DeploymentBoardPage;
