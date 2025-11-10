import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from "@mui/material";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const DeploymentBoardPage = () => {
  const [deploymentRequests, setDeploymentRequests] = useState([]);
  const [deploymentSupports, setDeploymentSupports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1))
        .toISOString()
        .split("T")[0];

      try {
        const [reqRes, supRes] = await Promise.all([
          api.get("/deployment-requests", { params: { startDate, endDate } }),
          api.get("/deployment-supports", { params: { startDate, endDate } }),
        ]);

        setDeploymentRequests(reqRes.data?.data || []);
        setDeploymentSupports(supRes.data?.data || []);
      } catch (err) {
        console.error("❌ Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const allEvents = [
    ...deploymentRequests.map((r) => ({ ...r, type: "request", date: r.implementDate })),
    ...deploymentSupports.map((s) => ({ ...s, type: "support", date: s.implementDate })),
  ];

  const eventsByWeek = {};
  allEvents.forEach((event) => {
    const weekStart = getWeekStart(event.date).toISOString().split("T")[0];
    if (!eventsByWeek[weekStart]) eventsByWeek[weekStart] = [];
    eventsByWeek[weekStart].push(event);
  });

  const riskColor = (event) => {
    if (event.type === "support") return "#90caf9";
    switch (event.riskImpact) {
      case "Low":
        return "#A5D6A7";
      case "Medium":
        return "#FFF59D";
      case "High":
        return "#EF9A9A";
      case "Major Release":
        return "#3a3a3a";
      default:
        return "#E0E0E0";
    }
  };

  return (
    <>
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ color: "#1976d2", mb: 3, textAlign: "center" }}
      >
        Deployment Board (Per Minggu)
      </Typography>

      <Box sx={{ display: "flex", gap: 2, overflowX: "auto" }}>
        {Object.keys(eventsByWeek)
          .sort()
          .map((weekStart) => {
            const weekStartDate = new Date(weekStart);
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekEndDate.getDate() + 6);
            return (
              <Paper key={weekStart} sx={{ minWidth: 250, p: 2, flexShrink: 0 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Minggu {formatDate(weekStartDate)} - {formatDate(weekEndDate)}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {eventsByWeek[weekStart]
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((event) => (
                      <Card
                        key={`${event.type}-${event.id}`}
                        sx={{
                          backgroundColor: riskColor(event),
                          cursor: "pointer",
                          "&:hover": { opacity: 0.8 },
                        }}
                      >
                        <CardContent sx={{ p: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {event.title}
                          </Typography>
                          <Typography variant="caption">
                            {formatDate(event.date)}
                          </Typography>
                          <Chip
                            label={event.type === "request" ? "Request" : "Support"}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                </Box>
              </Paper>
            );
          })}
      </Box>
    </>
  );
};

export default DeploymentBoardPage;
