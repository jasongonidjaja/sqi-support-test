import React, { useState } from "react";
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
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "";

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => setCollapsed(!collapsed);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // MENU
  const menuItems = [
    ...(role !== "sqi"
      ? [{ text: "Request Support SQI", icon: <AddCircleOutline />, path: "/create-task" }]
      : []),

    { text: "Support SQI List", icon: <ListAlt />, path: "/task-list" },

    ...(role === "developer"
      ? [
          { text: "Request Deployment", icon: <RocketLaunch />, path: "/request-deployment" },
          { text: "Add Support", icon: <SupportAgent />, path: "/create-support" },
        ]
      : []),

    { text: "Calendar", icon: <CalendarMonth />, path: "/calendar" },
    { text: "Knowledge Center", icon: <ListAlt />, path: "/knowledge-center" },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // =============== Drawer Content ===============
  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "#0a1f3c",
          color: "white",
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

        <IconButton size="small" sx={{ color: "white" }} onClick={toggleCollapse}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* MENU */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <Tooltip title={collapsed ? item.text : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: collapsed ? "center" : "flex-start",
                    px: collapsed ? 2 : 3,
                    borderLeft: isActive ? "4px solid #1e88e5" : "4px solid transparent",
                    backgroundColor: isActive ? "rgba(30, 136, 229, 0.18)" : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(21,101,192,0.18)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "#1e88e5" : "#e0e0e0",
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
                        color: isActive ? "#1e88e5" : "#e0e0e0",
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

      {/* LOGOUT */}
      <Tooltip title={collapsed ? "Logout" : ""} placement="right">
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            onClick={logout}
            sx={{
              minHeight: 48,
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 2 : 3,
            }}
          >
            <ListItemIcon
              sx={{
                color: "#ef5350",
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: "center",
              }}
            >
              <Logout />
            </ListItemIcon>

            {!collapsed && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ color: "#ef5350", fontWeight: "bold" }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </Tooltip>
    </Box>
  );

  // =============== MAIN RETURN ===============
  return (
    <>
      {/* MOBILE TOGGLE BUTTON */}
      <IconButton
        color="inherit"
        onClick={handleDrawerToggle}
        sx={{
          position: "fixed",
          top: 12,
          left: 12,
          display: { md: "none" },
          zIndex: 2000,
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* DESKTOP SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? collapsedWidth : expandedWidth,
          transition: "0.3s",
          [`& .MuiDrawer-paper`]: {
            width: collapsed ? collapsedWidth : expandedWidth,
            transition: "0.3s",
            boxSizing: "border-box",
            overflowX: "hidden",
            backgroundColor: "#0a1f3c",
            color: "white",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* MOBILE SIDEBAR */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          [`& .MuiDrawer-paper`]: {
            width: expandedWidth,
            backgroundColor: "#0a1f3c",
            color: "white",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
