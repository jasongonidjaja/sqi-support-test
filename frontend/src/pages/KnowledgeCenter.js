import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Pagination,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

const KnowledgeCenter = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Dropdown aplikasi
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");

  // Modal Add
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);

  // Modal Edit/Delete
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editProblem, setEditProblem] = useState("");
  const [editSolution, setEditSolution] = useState("");

  // Confirm delete
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Ambil daftar aplikasi dari backend
  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications");
      setApplications(res.data.data || []);
    } catch (err) {
      console.error("Failed to load applications:", err);
    }
  };

  // Ambil semua knowledge dengan filter dan search
  const fetchData = async (searchTerm = "", appFilter = "") => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.append("search", searchTerm);
      if (appFilter) query.append("application", appFilter);

      const res = await api.get(`/knowledge-center?${query.toString()}`);
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch knowledge center data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load awal
  useEffect(() => {
    fetchApplications();
    fetchData();
  }, []);

  // Live search dan filter aplikasi
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData(search, selectedApp);
      setPage(1);
    }, 400);
    return () => clearTimeout(delay);
  }, [search, selectedApp]);

  // Add new
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem || !solution) return;
    await api.post("/knowledge-center", {
      problem,
      solution,
      applicationId: selectedApp || null,
    });
    setProblem("");
    setSolution("");
    setOpenAddModal(false);
    fetchData(search, selectedApp);
  };

  // Open edit modal
  const handleOpenEditModal = (item) => {
    setEditId(item.id);
    setEditProblem(item.problem);
    setEditSolution(item.solution);
    setOpenEditModal(true);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editId) return;
    await api.put(`/knowledge-center/${editId}`, {
      problem: editProblem,
      solution: editSolution,
    });
    setOpenEditModal(false);
    fetchData(search, selectedApp);
  };

  // Open delete confirm
  const confirmDelete = (id) => {
    setDeleteId(id);
    setOpenConfirm(true);
  };

  // Delete confirmed
  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/knowledge-center/${deleteId}`);
    setOpenConfirm(false);
    setOpenEditModal(false);
    fetchData(search, selectedApp);
  };

  // Pagination
  const handlePageChange = (event, value) => setPage(value);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <Box>
      {/* HEADER */}
      <Box
        sx={{
          backgroundColor: "#1976d2",
          color: "white",
          py: 8,
          textAlign: "center",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={1}>
          Knowledge Center
        </Typography>
        <Typography variant="body1" mb={3}>
          Find answers to questions and solutions to problems
        </Typography>

        {/* FILTER & SEARCH */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              backgroundColor: "white",
              borderRadius: 2,
            }}
          >
            <InputLabel>Application</InputLabel>      
            <Select
              value={selectedApp}
              label="Application"
              onChange={(e) => setSelectedApp(e.target.value)}
            >
              <MenuItem value="">All Applications</MenuItem>
              {applications.map((app) => (
                <MenuItem key={app.id} value={app.id}>
                  {app.name}
                </MenuItem>
              ))}
          </Select>

          </FormControl>

          <TextField
            placeholder="Type keywords here..."
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: "40%", backgroundColor: "white", borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: loading && <CircularProgress size={20} />,
            }}
          />
        </Box>
      </Box>

      {/* CONTENT */}
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          mt: -6,
          mb: 4,
          p: 4,
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3}>
          List of Problems
        </Typography>

        {/* Tombol Add */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            sx={{ borderRadius: 3, backgroundColor: "#1976d2" }}
            onClick={() => setOpenAddModal(true)}
          >
            Add New
          </Button>

        {/* Modal Add */}
        <Dialog
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Add New Problem & Solution</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              {/* Dropdown Application */}
              <FormControl fullWidth size="small">
                <InputLabel>Application</InputLabel>
                <Select
                  value={selectedApp}
                  label="Application"
                  onChange={(e) => setSelectedApp(e.target.value)}
                >
                  <MenuItem value="">Select Application</MenuItem>
                  {applications.map((app) => (
                    <MenuItem key={app.id} value={app.id}>
                      {app.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Problem */}
              <TextField
                placeholder="Problem"
                variant="outlined"
                fullWidth
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />

              {/* Solution */}
              <TextField
                placeholder="Solution"
                variant="outlined"
                fullWidth
                multiline
                minRows={2}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#1976d2" }}
              onClick={handleSubmit}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        </Box>

        {/* Accordion list */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : paginatedData.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No Data found.
          </Typography>
        ) : (
          <>
            {paginatedData.map((item) => (
              <Accordion
                key={item.id}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  "&.Mui-expanded": { mb: 2 },
                  boxShadow: 1,
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight="bold">{item.problem}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ mb: 2 }}>{item.solution}</Typography>
                  <IconButton onClick={() => handleOpenEditModal(item)}>
                    <EditIcon color="primary" />
                  </IconButton>
                </AccordionDetails>
              </Accordion>
            ))}

            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Box>

      {/* Modal Edit & Delete */}
      <Dialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Problem & Solution</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Problem"
              variant="outlined"
              fullWidth
              value={editProblem}
              onChange={(e) => setEditProblem(e.target.value)}
            />
            <TextField
              label="Solution"
              variant="outlined"
              fullWidth
              multiline
              minRows={2}
              value={editSolution}
              onChange={(e) => setEditSolution(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => confirmDelete(editId)}
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
          <Box flexGrow={1} />
          <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#1976d2" }}
            onClick={handleSaveEdit}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeCenter;
