import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import {
  AddCircleOutline,
  ListAlt,
  Logout,
  CalendarMonth,
  RocketLaunch,
  SupportAgent,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240; // 🔹 Lebar sidebar tetap

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "";

  const menuItems = [
    ...(role !== "sqi"
      ? [{ text: "Create Support Task", icon: <AddCircleOutline />, path: "/create" }]
      : []),

    { text: "Support Task List", icon: <ListAlt />, path: "/tasks" },

    ...(role === "developer"
      ? [
          { text: "Request Deployment", icon: <RocketLaunch />, path: "/request-deployment" },
          { text: "Create Deployment Support", icon: <SupportAgent />, path: "/create-deployment-support" },
        ]
      : []),

    { text: "Deployment Calendar", icon: <CalendarMonth />, path: "/deployment-calendar" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#1976d2",
          color: "white",
          borderRight: "none",
          px: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h6" fontWeight="bold">
          SQI Support
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {role ? role.toUpperCase() : "GUEST"}
        </Typography>
      </Box>

      {/* Menu */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ color: "white" }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Navbar;
export { drawerWidth }; // penting agar bisa dipakai di layout
