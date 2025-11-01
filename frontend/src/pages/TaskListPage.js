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
  InputLabel,
  Button,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sqiPics, setSqiPics] = useState([]);
  // const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  // console.log("User Role dari localStorage:", userRole);

  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.role || null;
  console.log("User Role dari localStorage:", userRole);


  // Fetch semua task
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/tasks");
        setTasks(res.data.data || []);
      } catch (err) {
        console.error("❌ Gagal mengambil data task:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Fetch daftar PIC SQI (hanya untuk role sqi)
  useEffect(() => {
     // Cek nilai userRole sebelum melakukan pengecekan

    const fetchSqiPics = async () => {
      if (userRole !== "sqi") {
        console.log("User bukan SQI, data tidak diambil");
        return;
      }
      try {
        const res = await api.get("/sqi-pics");
        console.log("Data SQI yang diterima:", res.data); // Cek data yang diterima
        setSqiPics(res.data || []);
      } catch (err) {
        console.error("❌ Gagal mengambil daftar PIC SQI:", err);
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
    } catch (err) {
      console.error("❌ Error updating task status:", err);
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
            ? { ...task, sqiPic: selectedPic || null }
            : task
        )
      );
    } catch (err) {
      console.error("❌ Gagal assign PIC SQI:", err);
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
          backgroundColor: "transparent",
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
          Daftar Support
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: 3,
            width: "90%",
            maxWidth: 900,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Judul
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Deskripsi
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Bentuk Support
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Aplikasi
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  PIC SQI
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Attachment
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Tanggal Dibuat
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      },
                    }}
                  >
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      {task.supportType
                        ? task.supportType.name
                        : task.customSupportType || "—"}
                    </TableCell>
                    <TableCell>{task.application?.name || "—"}</TableCell>

                    {/* 🔹 Kolom PIC SQI */}
                    <TableCell>
                      {userRole === "sqi" ? (
                        <FormControl fullWidth size="small">
                          {/* <InputLabel>PIC SQI</InputLabel> */}
                          <Select
                            value={task.sqiPic?.id || ""}
                            label="PIC SQI"
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

                    {/* 🔹 Kolom Status */}
                    <TableCell>
                      {userRole === "sqi" ? (
                        <FormControl fullWidth size="small">
                          {/* <InputLabel>Status</InputLabel> */}
                          <Select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task.id, e.target.value)
                            }
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
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
                          href={`http://localhost:4000/${task.attachment.replace(/\\/g, "/")}`}
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
                    colSpan={6}
                    align="center"
                    sx={{ color: "#757575", py: 4 }}
                  >
                    Belum ada task.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default TaskListPage;
