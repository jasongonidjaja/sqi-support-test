import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const DeploymentCalendarPage = () => {
  const [deploymentRequests, setDeploymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeploymentRequests = async () => {
      try {
        const res = await api.get("/deployment-requests", {
          params: {
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
              .toISOString()
              .split("T")[0],
          },
        });

        const requests = res.data?.data || res.data || [];
        setDeploymentRequests(requests);
      } catch (err) {
        console.error("❌ Gagal mengambil data deployment requests:", err);
        setDeploymentRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeploymentRequests();
  }, []);

  const calendarEvents = (deploymentRequests || []).map((request) => ({
    title: `${request.title} - ${request.riskImpact}`,
    date: request.implementDate,
    description: request.applicationName,
    backgroundColor:
      request.riskImpact === "Low"
        ? "#A5D6A7" // soft green
        : request.riskImpact === "Medium"
        ? "#FFF59D" // soft yellow
        : "#EF9A9A", // soft red
  }));

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          marginLeft: "220px",
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: "220px",
          minHeight: "100vh",
          backgroundColor: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            color: "#1976d2",
            mb: 3,
            textAlign: "center",
            mt: 2,
          }}
        >
          Kalender Request Deployment
        </Typography>

        <Paper
          elevation={3}
          sx={{
            width: "90%",
            maxWidth: 900,
            p: 2,
            borderRadius: 2,
          }}
        >
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height="80vh"
            events={calendarEvents}
            eventDisplay="block"
            eventTextColor="#000"
            eventBorderColor="#00000030"
            displayEventTime={false} // ⬅️ Hilangkan jam "7a"
            eventDidMount={(info) => {
              // Agar teks terlihat lebih rapi di tengah
              info.el.style.padding = "4px 6px";
              info.el.style.borderRadius = "4px";
              info.el.style.fontWeight = "600";
              info.el.style.textAlign = "center";
            }}
          />

        </Paper>
      </Box>
    </Box>
  );
};

export default DeploymentCalendarPage;
