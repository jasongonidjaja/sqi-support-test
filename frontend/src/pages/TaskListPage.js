import React, { useEffect, useState } from 'react';
import api from '../services/api';
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
  Snackbar,
  Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useLocation } from 'react-router-dom';

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sqiPics, setSqiPics] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const location = useLocation();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const limit = 10;

  const userData = JSON.parse(localStorage.getItem('user'));
  const userRole = userData?.role || null;

  useEffect(() => {
    if (location.state?.alert) {
      setSnackbar({
        open: true,
        message: location.state.alert,
        severity: location.state.type || 'success',
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchTasks = async (currentPage = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks?page=${currentPage}&limit=${limit}`);
      setTasks(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('❌ Error fetching tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(page);
  }, [page]);

  useEffect(() => {
    const fetchSqiPics = async () => {
      if (userRole !== 'sqi') return;
      try {
        const res = await api.get('/sqi-pics');
        setSqiPics(res.data?.data || res.data || []);
      } catch (err) {
        console.error('❌ Error fetching PIC SQI:', err);
        setSqiPics([]);
      }
    };
    fetchSqiPics();
  }, [userRole]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      setSnackbar({
        open: true,
        message: `Status updated to ${newStatus}`,
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to update status',
        severity: 'error',
      });
    }
  };

  const handleAssignSQI = async (taskId, sqiPicId) => {
    try {
      await api.put(`/tasks/${taskId}/assign`, { sqi_pic_id: sqiPicId });
      const selectedPic = sqiPics.find((p) => p.id === sqiPicId);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, sqiPic: selectedPic || null, status: 'in_progress' }
            : task
        )
      );
      setSnackbar({
        open: true,
        message: `Assigned to ${selectedPic?.name}`,
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to assign PIC SQI',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <>
      {/* Background gradien — gunakan zIndex 0 */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #E3F2FD, #FFFFFF)',
          zIndex: 0,
        }}
      />

      {/* Konten utama — beri zIndex lebih tinggi agar terlihat di atas background */}
      <Box sx={{ display: 'flex', position: 'relative', zIndex: 1 }}>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // opsional: padding top agar tidak nempel ke atas
            pt: 6,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              mb: 4,
              textAlign: 'center',
              color: '#1E88E5',
              textShadow: '0 1px 1px rgba(0,0,0,0.15)',
            }}
          >
            Support SQI List
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              width: '95%',
              maxWidth: 1300,
              overflowX: 'auto',
              // opsional: sedikit transparansi agar gradien tetap terasa di pinggir
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.95))',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    'Title',
                    'Description',
                    'Support Type',
                    'Application',
                    'PIC SQI',
                    'Status',
                    'Attachment',
                    'Created Date',
                  ].map((head) => (
                    <TableCell
                      key={head}
                      align="center"
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                        backgroundColor: 'background.paper',
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TableRow key={task.id} hover>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.description}</TableCell>

                      <TableCell>
                        {task.supportType
                          ? task.supportType.name
                          : task.customSupportType || '—'}
                      </TableCell>

                      <TableCell>{task.taskApplication?.name || '—'}</TableCell>

                      <TableCell>
                        {userRole === 'sqi' ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={task.sqiPic?.id ?? ''}
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
                          task.sqiPic?.name || '—'
                        )}
                      </TableCell>

                      <TableCell>
                        {userRole === 'sqi' ? (
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
                            size="small"
                            startIcon={<DownloadIcon />}
                            component="a"
                            href={`http://localhost:4000/${task.attachment.replace(
                              /\\/g,
                              '/'
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            sx={{ textTransform: 'none' }}
                          >
                            Download
                          </Button>
                        ) : (
                          '—'
                        )}
                      </TableCell>

                      <TableCell>
                        {new Date(task.createdAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 4, color: 'text.secondary' }}
                    >
                      No SQI support requests yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, newPage) => setPage(newPage)}
              color="primary"
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
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default TaskListPage;
