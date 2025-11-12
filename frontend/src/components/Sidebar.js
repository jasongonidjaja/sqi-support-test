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
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AddCircleOutline,
  ListAlt,
  Logout,
  CalendarMonth,
  RocketLaunch,
  SupportAgent,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const expandedWidth = 240;
const collapsedWidth = 72;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 untuk deteksi path aktif
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "";

  // 🔹 Menu utama
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

    { text: "Deployment Calendar", icon: <CalendarMonth />, path: "/deployment-board" },
  ];

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 🔹 State
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);

  // 🔹 Isi Drawer
  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "#1976d2",
          color: "white",
          textAlign: collapsed ? "center" : "left",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <Box>
            <Typography variant="h6" fontWeight="bold">
              SQI Support
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {role ? role.toUpperCase() : "GUEST"}
            </Typography>
          </Box>
        )}
        <IconButton size="small" onClick={toggleCollapse} sx={{ color: "white" }}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* Menu */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path; // 👈 aktif jika path cocok
          return (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <Tooltip title={collapsed ? item.text : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: collapsed ? "center" : "initial",
                    px: collapsed ? 2 : 3,
                    borderLeft: isActive ? "4px solid #1976d2" : "4px solid transparent",
                    backgroundColor: isActive ? "rgba(25, 118, 210, 0.1)" : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.15)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "#1976d2" : "#5f6368",
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        color: isActive ? "primary" : "inherit",
                        fontWeight: isActive ? "bold" : "normal",
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Logout */}
      <Tooltip title={collapsed ? "Logout" : ""} placement="right">
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 48,
              justifyContent: collapsed ? "center" : "initial",
              px: collapsed ? 2 : 3,
            }}
          >
            <ListItemIcon
              sx={{
                color: "#d32f2f",
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: "center",
              }}
            >
              <Logout />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Logout" />}
          </ListItemButton>
        </ListItem>
      </Tooltip>
    </Box>
  );

  return (
    <>
      {/* Tombol toggle (mobile) */}
      <IconButton
        color="inherit"
        onClick={handleDrawerToggle}
        sx={{
          position: "fixed",
          top: 10,
          left: 10,
          display: { md: "none" },
          zIndex: 1201,
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Sidebar utama (desktop) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? collapsedWidth : expandedWidth,
          flexShrink: 0,
          transition: "width 0.3s",
          [`& .MuiDrawer-paper`]: {
            width: collapsed ? collapsedWidth : expandedWidth,
            boxSizing: "border-box",
            transition: "width 0.3s",
            overflowX: "hidden",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Sidebar mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          [`& .MuiDrawer-paper`]: {
            width: expandedWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
