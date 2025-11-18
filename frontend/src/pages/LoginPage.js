import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Aurora from "../components/Aurora";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", form);
      const { token, role, username } = response.data;

      localStorage.setItem("user", JSON.stringify({ token, role, username }));
      login(token, role, username);

      navigate("/calendar");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 401)
        setError("Incorrect username or password.");
      else setError(err.response?.data?.message || "Server error, please try again.");
    }
  };

  return (
    <>
      {/* Aurora Effect */}
      {/* <Aurora
        colorStops={["#1A237E", "#3949AB", "#82B1FF"]}
        amplitude={1.1}
        blend={0.55}
      /> */}

      {/* Dark Blue Background */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#133c75ff",
          zIndex: -1,
        }}
      />

      <Container
        maxWidth="xs"
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
        }}
      >
        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(14px)",
            padding: 4,
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={3} sx={{ color: "#E3F2FD" }}>
            Welcome Back
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
              InputLabelProps={{ style: { color: "#BBDEFB" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#BBDEFB", borderRadius: 30 },
                  "&:hover fieldset": { borderColor: "#E3F2FD" },
                  "&.Mui-focused fieldset": { borderColor: "#90CAF9" },
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
              InputLabelProps={{ style: { color: "#BBDEFB" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#BBDEFB", borderRadius: 30 },
                  "&:hover fieldset": { borderColor: "#E3F2FD" },
                  "&.Mui-focused fieldset": { borderColor: "#90CAF9" },
                },
              }}
            />

            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: "left" }}>
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
                paddingY: 1.3,
                borderRadius: 30,
                backgroundColor: "#2A3142",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default LoginPage;
