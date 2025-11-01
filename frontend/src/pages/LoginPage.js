import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setAuthData } from "../middleware/auth";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", form);
      const { token, role, username } = response.data;

      localStorage.setItem("username", username);
      localStorage.setItem("user", JSON.stringify({ token, role, username }));

      login(token, role, username);
      navigate("/tasks");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 401) setError("Username atau password salah.");
      else setError("Terjadi kesalahan saat login.");
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent", // tanpa warna
      }}
    >
      <Box sx={{ width: "100%", textAlign: "center" }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          mb={3}
          sx={{ color: "#1976d2" }} // biru utama
        >
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            size="small"
            InputLabelProps={{ style: { color: "#1976d2" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#1976d2" },
                "&:hover fieldset": { borderColor: "#115293" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            size="small"
            InputLabelProps={{ style: { color: "#1976d2" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#1976d2" },
                "&:hover fieldset": { borderColor: "#115293" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
          />

          {error && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 1, textAlign: "left" }}
            >
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 3,
              width: "100%",
              textTransform: "none",
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#115293" },
              paddingY: 1.3,
            }}
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
