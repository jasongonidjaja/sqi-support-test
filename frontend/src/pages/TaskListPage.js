import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  Button,
  Pagination,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useLocation } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sqiPics, setSqiPics] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const location = useLocation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  const limit = 10; // jumlah data per halaman

  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.role || null;

  useEffect(() => {
    if (location.state?.alert) {
      setSnackbar({
        open: true,
        message: location.state.alert,
        severity: location.state.type || "success",
      });

      // Hapus state agar tidak repeat saat refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


  // Fetch semua task (dengan pagination)
  const fetchTasks = async (currentPage = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks?page=${currentPage}&limit=${limit}`);
      setTasks(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("❌ Gagal mengambil data task:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(page);
  }, [page]);

  // Fetch daftar PIC SQI (hanya untuk role sqi)
  useEffect(() => {
    const fetchSqiPics = async () => {
      if (userRole !== "sqi") return;
      try {
        const res = await api.get("/sqi-pics");
        setSqiPics(res.data?.data || res.data || []);
      } catch (err) {
        console.error("❌ Gagal mengambil daftar PIC SQI:", err);
        setSqiPics([]);
      }
    };
    fetchSqiPics();
  }, [userRole]);

  // Update status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // 🔥 SNACKBAR BERHASIL
      setSnackbar({
        open: true,
        message: `Status berhasil diubah menjadi ${newStatus}`,
        severity: "success",
      });

    } catch (err) {
      // 🔥 SNACKBAR ERROR
      setSnackbar({
        open: true,
        message: "Gagal mengubah status",
        severity: "error",
      });
    }
  };


  // Assign PIC SQI
  const handleAssignSQI = async (taskId, sqiPicId) => {
    try {
      await api.put(`/tasks/${taskId}/assign`, { sqi_pic_id: sqiPicId });

      const selectedPic = sqiPics.find((p) => p.id === sqiPicId);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                sqiPic: selectedPic || null,
                status: "in_progress",
              }
            : task
        )
      );

      // 🔥 SNACKBAR BERHASIL
      setSnackbar({
        open: true,
        message: `PIC SQI berhasil di-assign ke ${selectedPic?.name}`,
        severity: "success",
      });

    } catch (err) {
      // 🔥 SNACKBAR ERROR
      setSnackbar({
        open: true,
        message: "Gagal assign PIC SQI",
        severity: "error",
      });
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
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ color: "#1976d2", mb: 3, textAlign: "center", mt: 2 }}
        >
          Support SQI List
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: 3,
            width: "95%",
            maxWidth: 1300,
            overflowX: "auto",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#fff" }}>
                  Title
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#fff" }}>
                  Description
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#fff" }}>
                  Support Type
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#fff" }}>
                  Application
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#fff" }}>
                  PIC SQI
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#fff" }}>
                  Status
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#fff" }}>
                  Attachment
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#fff" }}>
                  Created Date
                </TableCell>
              </TableRow>
            </TableHead>


            <TableBody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    sx={{
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
                    }}
                  >
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      {task.supportType
                        ? task.supportType.name
                        : task.customSupportType || "—"}
                    </TableCell>
                    <TableCell>{task.taskApplication?.name || "—"}</TableCell>

                    <TableCell>
                      {userRole === "sqi" ? (
                        <FormControl fullWidth size="small">
                          <Select
                            value={task.sqiPic?.id ?? ""}
                            onChange={(e) =>
                              handleAssignSQI(task.id, e.target.value)
                            }
                          >
                            {sqiPics.map((pic) => (
                              <MenuItem key={pic.id} value={pic.id}>
                                {pic.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        task.sqiPic?.name || "—"
                      )}
                    </TableCell>

                    <TableCell>
                      {userRole === "sqi" ? (
                        <FormControl fullWidth size="small">
                          <Select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task.id, e.target.value)
                            }
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in_progress">
                              In Progress
                            </MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        task.status
                      )}
                    </TableCell>

                    <TableCell>
                      {task.attachment ? (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<DownloadIcon />}
                          component="a"
                          href={`http://localhost:4000/${task.attachment.replace(
                            /\\/g,
                            "/"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          sx={{
                            textTransform: "none",
                            fontWeight: 500,
                          }}
                        >
                          Download
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell>
                      {new Date(task.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ color: "#757575", py: 4 }}
                  >
                    No SQI support requests yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 🔹 Pagination Section */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
            size="medium"
            sx={{
              "& .MuiPaginationItem-root": { fontWeight: 500 },
            }}
          />
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskListPage;
