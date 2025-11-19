import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const CreateTaskPage = () => {
  const [supportTypes, setSupportTypes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [sqiPics, setSqiPics] = useState([]);
  const [form, setForm] = useState({
    title: '',
    supportType: '',
    customSupportType: '',
    description: '',
    applicationId: '',
    sqiPicId: '',
    attachment: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supportRes, appRes, picRes] = await Promise.all([
          axios.get('http://localhost:4000/api/support-types', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          axios.get('http://localhost:4000/api/applications', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          axios.get('http://localhost:4000/api/sqi-pics', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
        ]);

        setSupportTypes(supportRes.data?.data || []);
        setApplications(appRes.data?.data || []);
        setSqiPics(picRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
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
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('supportType', form.supportType);
    formData.append(
      'customSupportType',
      form.supportType === 'Other' ? form.customSupportType : ''
    );
    formData.append('applicationId', form.applicationId);
    formData.append('sqiPicId', form.sqiPicId);

    if (form.attachment) {
      formData.append('attachment', form.attachment);
    }

    try {
      await axios.post('http://localhost:4000/api/tasks', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/task-list', {
        state: { alert: 'Task created successfully!', type: 'success' },
      });
    } catch (err) {
      console.error('Error creating task:', err);
      navigate('/task-list', {
        state: {
          alert: 'Failed to save task. Please try again.',
          type: 'error',
        },
      });
    }
  };

  return (
    <>
      {/* Light background */}
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
            Request Support SQI
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Title */}
            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />

            {/* Support Type */}
            <TextField
              select
              label="Support Type"
              name="supportType"
              value={form.supportType}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              {supportTypes.map((type) => (
                <MenuItem key={type.id} value={type.name}>
                  {type.name}
                </MenuItem>
              ))}
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            {form.supportType === 'Other' && (
              <TextField
                label="Custom Support Type"
                name="customSupportType"
                value={form.customSupportType}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
            )}

            {/* Application */}
            <TextField
              select
              label="Application"
              name="applicationId"
              value={form.applicationId}
              onChange={handleChange}
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

            {/* Description */}
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              required
              sx={{ mb: 2 }}
            />

            {/* Attachment */}
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
                '&:hover': { backgroundColor: '#1565C0' },
              }}
            >
              Save
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default CreateTaskPage;
