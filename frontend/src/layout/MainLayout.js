// src/layout/MainLayout.js
import React from "react";
import Navbar, { drawerWidth } from "../components/Navbar"; // 🔹 import drawerWidth dari Navbar
import { Box, CssBaseline } from "@mui/material";

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3, // beri sedikit padding agar konten tidak terlalu mepet tepi
          backgroundColor: "#1868b8ff",
          ml: `${drawerWidth}px`, // 🔹 offset sesuai lebar sidebar
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
