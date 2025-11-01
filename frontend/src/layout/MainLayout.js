// src/layout/MainLayout.js
import React from "react";
import Navbar from "../components/Navbar";
import { Box, CssBaseline } from "@mui/material";

const drawerWidth = 0; // pastikan sesuai dengan lebar sidebar kamu

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          backgroundColor: "#f4f6f8",
          ml: `${drawerWidth}px`, // offset agar tidak tertutup sidebar
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
