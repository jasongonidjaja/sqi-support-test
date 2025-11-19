import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const CreateDeploymentRequestPage = () => {
  const [form, setForm] = useState({
    releaseId: '',
    title: '',
    implementDate: null,
    applicationId: '',
    riskImpact: 'Low',
    attachment: null,
  });

  const [applications, setApplications] = useState([]);
  const [freezeDates, setFreezeDates] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  const navigate = useNavigate();

  // Ambil data aplikasi & freeze date
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const [appRes, freezeRes] = await Promise.all([
          api.get('/applications', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get('/freeze-dates', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setApplications(appRes.data?.data || []);

        const freezeArray = Array.isArray(freezeRes.data)
          ? freezeRes.data
          : freezeRes.data?.data || [];

        const expandedDates = [];

        freezeArray.forEach((range) => {
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            expandedDates.push(d.toLocaleDateString('en-CA'));
          }
        });

        setFreezeDates(expandedDates);
      } catch (err) {
        console.error('❌ Gagal mengambil data:', err);
      }
    };

    fetchData();
  }, []);

  const isDateDisabled = (date) => {
    const formatted = date.toLocaleDateString('en-CA');
    return freezeDates.includes(formatted);
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, attachment: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.implementDate) {
      setAlertType('error');
      setAlertMessage('Tanggal implementasi wajib diisi.');
      setAlertOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append('releaseId', form.releaseId);
    formData.append('title', form.title);

    const d = new Date(form.implementDate);
    const formattedDate = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    formData.append('implementDate', formattedDate);
    formData.append('applicationId', form.applicationId);
    formData.append('riskImpact', form.riskImpact);
    if (form.attachment) formData.append('attachment', form.attachment);

    try {
      await api.post('/deployment-requests', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/calendar', {
        state: {
          alertType: 'success',
          alertMessage: 'Deployment request created successfully!',
        },
      });
    } catch (err) {
      console.error('❌ Failed create deployment request:', err);
      setAlertType('error');
      setAlertMessage('Failed to save deployment request.');
      setAlertOpen(true);
    }
  };

  return (
    <>
      {/* Background gradasi seperti CreateTask */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #E3F2FD, #FFFFFF)',
          zIndex: -1,
        }}
      />

      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: 420,
            p: 4,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(180,180,255,0.2)',
            boxShadow: '0 10px 32px rgba(0,0,0,0.15)',
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
            Request Deployment
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Release ID"
              value={form.releaseId}
              onChange={(e) => handleChange('releaseId', e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />

            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Implement Date"
                value={form.implementDate}
                minDate={new Date()}
                onChange={(v) => handleChange('implementDate', v)}
                shouldDisableDate={isDateDisabled}
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
              select
              label="Application"
              value={form.applicationId}
              onChange={(e) => handleChange('applicationId', e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              {applications.map((app) => (
                <MenuItem key={app.id} value={app.id}>
                  {app.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Risk Impact"
              value={form.riskImpact}
              onChange={(e) => handleChange('riskImpact', e.target.value)}
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
              sx={{ mb: 2, textTransform: 'none' }}
            >
              {form.attachment ? 'Change File' : 'Select Attachment File'}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>

            {form.attachment && (
              <Typography
                variant="body2"
                sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}
              >
                📄 {form.attachment.name}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#1E88E5',
                borderRadius: 30,
                textTransform: 'none',
                py: 1.3,
                '&:hover': { backgroundColor: '#1565C0' },
              }}
            >
              Save
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={alertType} variant="filled" sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateDeploymentRequestPage;
