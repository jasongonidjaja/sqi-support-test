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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

const KnowledgeCenter = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Fetch data
  const fetchData = async (searchTerm = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/knowledge-center?search=${searchTerm}`);
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Live search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);

  // Add new
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem || !solution) return;
    await api.post("/knowledge-center", { problem, solution });
    setProblem("");
    setSolution("");
    setOpenAddModal(false);
    fetchData(search);
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
    fetchData(search);
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
    fetchData(search);
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
        <TextField
          placeholder="Type keywords here..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "50%", backgroundColor: "white", borderRadius: 2 }}
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
          List of Problem
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
                <TextField
                  placeholder="Problem"
                  variant="outlined"
                  fullWidth
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                />
                <TextField
                  placeholder="Solution"
                  variant="outlined"
                  fullWidth
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
          <Button onClick={() => confirmDelete(editId)} color="error" startIcon={<DeleteIcon />}>
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
