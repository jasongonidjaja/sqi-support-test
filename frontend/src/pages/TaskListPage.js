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

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sqiPics, setSqiPics] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10; // jumlah data per halaman

  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.role || null;
  // console.log("User Role:", userRole);

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
    } catch (err) {
      console.error("❌ Error updating task status:", err);
    }
  };

  // Assign PIC SQI
  const handleAssignSQI = async (taskId, sqiPicId) => {
    try {
      await api.put(`/tasks/${taskId}/assign`, { sqi_pic_id: sqiPicId });

      const selectedPic = sqiPics.find((p) => p.id === sqiPicId);

      // Update data di state langsung tanpa reload
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                sqiPic: selectedPic || null,
                status: "in_progress", // otomatis ubah status di UI
              }
            : task
        )
      );

    } catch (err) {
      console.error("❌ Failed assign PIC SQI:", err);
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
                            value={task.sqiPic?.id || ""}
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
    </Box>
  );
};

export default TaskListPage;
