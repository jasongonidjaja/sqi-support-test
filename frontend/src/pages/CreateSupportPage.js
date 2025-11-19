import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const CreateSupportPage = () => {
  const [form, setForm] = useState({
    releaseId: '',
    application: '',
    title: '',
    implementDate: null,
    impactedApplication: '',
    note: '',
    attachment: null,
    riskImpact: 'Low',
  });

  const [freezeDates, setFreezeDates] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  const navigate = useNavigate();

  // Ambil freeze date
  useEffect(() => {
    const fetchFreezeDates = async () => {
      try {
        const token = localStorage.getItem('token');

        const freezeRes = await api.get('/freeze-dates', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const freezeArray = Array.isArray(freezeRes.data)
          ? freezeRes.data
          : freezeRes.data.data || [];

        const expanded = [];
        freezeArray.forEach((range) => {
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            expanded.push(d.toLocaleDateString('en-CA'));
          }
        });

        setFreezeDates(expanded);
      } catch (err) {
        console.error('❌ Failed to fetch freeze dates:', err);
      }
    };

    fetchFreezeDates();
  }, []);

  const isDateDisabled = (date) => {
    const formatted = date.toLocaleDateString('en-CA');
    return freezeDates.includes(formatted);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (value) => {
    setForm({ ...form, implementDate: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, attachment: e.target.files[0] });
  };

  const handleAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCloseAlert = (_, reason) => {
    if (reason === 'clickaway') return;
    setAlertOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.implementDate) {
      handleAlert('Implementation date is required!', 'warning');
      return;
    }

    const d = new Date(form.implementDate);
    const implementDate = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (freezeDates.includes(implementDate)) {
      handleAlert('Selected date is within a freeze period!', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('releaseId', form.releaseId);
    formData.append('application', form.application);
    formData.append('title', form.title);
    formData.append('implementDate', implementDate);
    formData.append('impactedApplication', form.impactedApplication);
    formData.append('note', form.note);
    formData.append('riskImpact', form.riskImpact);

    if (form.attachment) {
      formData.append('attachment', form.attachment);
    }

    try {
      await api.post('/supports', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/calendar', {
        state: {
          alertMessage: 'Support successfully created!',
          alertType: 'success',
        },
      });
    } catch (err) {
      navigate('/calendar', {
        state: {
          alertMessage: 'Gagal membuat support',
          alertType: 'error',
        },
      });
      console.error('❌ Failed to create Support:', err);
    }
  };

  return (
    <>
      {/* Background Gradasi */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#eaf5fcff',
          zIndex: -1,
        }}
      />

      <Box
        sx={{
          minHeight: '100vh',
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
            Create Support Request
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Release ID"
              name="releaseId"
              value={form.releaseId}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { fontSize: '1.1rem' } }}
              InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
            />

            <TextField
              label="Application"
              name="application"
              value={form.application}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { fontSize: '1.1rem' } }}
              InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
            />

            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { fontSize: '1.1rem' } }}
              InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
            />

            {/* Date Picker */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Implement Date"
                value={form.implementDate}
                onChange={handleDateChange}
                shouldDisableDate={isDateDisabled}
                minDate={new Date()}
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
              label="Impacted Application"
              name="impactedApplication"
              value={form.impactedApplication}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { fontSize: '1.1rem' } }}
              InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
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
              InputProps={{ sx: { fontSize: '1.1rem' } }}
              InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
            />

            <TextField
              select
              label="Risk Impact"
              name="riskImpact"
              value={form.riskImpact}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{ sx: { fontSize: '1.1rem' } }}
              InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Major Release">Major Release</MenuItem>
            </TextField>

            {/* Attachment */}
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
              sx={{
                mb: 2,
                textTransform: 'none',
                fontSize: '1.1rem', // <<< ukuran teks diperbesar
                py: 1.2, // biar proporsional
              }}
            >
              {form.attachment ? 'Change File' : 'Select Attachment File'}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>

            {form.attachment && (
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  fontSize: '1.1rem', // <<< ukuran teks diperbesar
                }}
              >
                📄 {form.attachment.name}
              </Typography>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 1,
                backgroundColor: '#1E88E5',
                borderRadius: 30,
                textTransform: 'none',
                py: 1.3,
                fontSize: '1.1rem', // <<< ukuran teks diperbesar
                '&:hover': { backgroundColor: '#1565C0' },
              }}
            >
              Save
            </Button>
          </Box>
        </Paper>

        <Snackbar
          open={alertOpen}
          autoHideDuration={3000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseAlert}
            severity={alertSeverity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default CreateSupportPage;
