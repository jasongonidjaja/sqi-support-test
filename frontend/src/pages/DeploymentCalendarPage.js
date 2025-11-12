// import React, { useEffect, useState } from "react";
// import api from "../services/api";
// import {
//   Box,
//   Typography,
//   CircularProgress,
//   Paper,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
// } from "@mui/material";
// import DownloadIcon from "@mui/icons-material/Download";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";

// const DeploymentCalendarPage = () => {
//   const [deploymentRequests, setDeploymentRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [statuses] = useState(["null", "success", "redeploy", "cancel"]); // ✅ daftar status
//   const [sqiPics, setSqiPics] = useState([]); // ✅ daftar PIC SQI
//   const [selectedStatus, setSelectedStatus] = useState("");
//   const [selectedPic, setSelectedPic] = useState("");

//   // simulasi role SQI (nanti bisa ganti dari context/login)
//   const role = "SQI";

//   const handleEventClick = (info) => {
//     const { id, title, extendedProps } = info.event; // ⬅️ tambahkan id di sini
//     setSelectedEvent({
//       id, // ⬅️ gunakan id langsung dari event, bukan dari extendedProps
//       title,
//       implementDate: extendedProps.implementDate,
//       applicationName: extendedProps.applicationName,
//       riskImpact: extendedProps.riskImpact,
//       attachment: extendedProps.attachment,
//       status: extendedProps.status || "null",
//       sqiPicId: extendedProps.sqiPicId || null,
//     });
//     setSelectedStatus(extendedProps.status || "null");
//     setSelectedPic(extendedProps.sqiPicId || "");
//     setOpenDialog(true);
//   };

//     // 🧩 Tambahkan ini di luar useEffect (misal di bawah handleEventClick)
//   const fetchDeploymentRequests = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/deployment-requests", {
//         params: {
//           startDate: new Date().toISOString().split("T")[0],
//           endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
//             .toISOString()
//             .split("T")[0],
//         },
//       });
//       const requests = res.data?.data || res.data || [];
//       setDeploymentRequests(requests);
//     } catch (err) {
//       console.error("❌ Gagal mengambil data deployment requests:", err);
//       setDeploymentRequests([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const fetchSqiPics = async () => {
//       try {
//         const res = await api.get("/sqi-pics");
//         setSqiPics(res.data?.data || res.data || []);
//       } catch (err) {
//         console.error("❌ Gagal mengambil data SQI PIC:", err);
//       }
//     };

//     fetchDeploymentRequests();
//     if (role === "SQI") fetchSqiPics();
//   }, []);

//   const calendarEvents = (deploymentRequests || []).map((request) => ({
//     id: request.id,
//     title: `${request.title} - ${request.riskImpact}`,
//     date: request.implementDate,
//     implementDate: request.implementDate,
//     applicationName: request.application?.name || "Unknown",
//     riskImpact: request.riskImpact,
//     attachment: request.attachment,
//     status: request.status,
//     sqiPicId: request.sqiPicId,
//     backgroundColor:
//       request.riskImpact === "Low"
//         ? "#A5D6A7"
//         : request.riskImpact === "Medium"
//         ? "#FFF59D"
//         : request.riskImpact === "High"
//         ? "#EF9A9A"
//         : request.riskImpact === "Major Release"
//         ? "#3a3a3aff"
//         : "#E0E0E0",
//     textColor:
//       request.riskImpact === "Major Release" ? "#FFFFFF" : "#000000",
//   }));

//   const handleDownload = async () => {
//     try {
//       if (!selectedEvent?.attachment) return;
//       const filename = selectedEvent.attachment.split("/").pop();
//       const response = await api.get(`/deployment-requests/download/${filename}`, {
//         responseType: "blob",
//       });
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", filename);
//       document.body.appendChild(link);
//       link.click();
//       link.parentNode.removeChild(link);
//     } catch (err) {
//       console.error("❌ Gagal mengunduh file:", err);
//       alert("Gagal mengunduh file.");
//     }
//   };

// const [isUpdating, setIsUpdating] = useState(false);

// const handleStatusChange = async (event) => {
//   if (isUpdating) return; // ⛔ cegah klik ganda
//   setIsUpdating(true);

//   const newStatus = event.target.value;
//   setSelectedStatus(newStatus);

//   try {
//     await api.patch(`/deployment-requests/${selectedEvent.id}`, {
//       status: newStatus === "null" ? null : newStatus,
//     });

//     console.log(`✅ Status updated to: ${newStatus}`);

//     // 🔄 Auto-refresh kalender
//     await fetchDeploymentRequests();

//     // ✅ Update data modal agar konsisten tanpa menutup dialog
//     setSelectedEvent((prev) => ({
//       ...prev,
//       status: newStatus === "null" ? null : newStatus,
//     }));

//     alert("Status berhasil diperbarui!");
//   } catch (err) {
//     console.error("❌ Gagal memperbarui status:", err);
//     alert("Gagal memperbarui status.");
//   } finally {
//     setIsUpdating(false);
//   }
// };

// const handleAssignPic = async (event) => {
//   if (isUpdating) return; // ⛔ cegah klik ganda
//   setIsUpdating(true);

//   const picId = event.target.value;
//   setSelectedPic(picId);

//   try {
//     await api.patch(`/deployment-requests/${selectedEvent.id}`, {
//       sqiPicId: picId === "" ? null : picId,
//     });

//     console.log(`✅ SQI PIC assigned: ${picId}`);

//     // 🔄 Auto-refresh kalender
//     await fetchDeploymentRequests();

//     // ✅ Update data modal agar konsisten tanpa menutup dialog
//     setSelectedEvent((prev) => ({
//       ...prev,
//       sqiPicId: picId === "" ? null : picId,
//     }));

//     alert("PIC berhasil di-assign!");
//   } catch (err) {
//     console.error("❌ Gagal assign PIC:", err);
//     alert("Gagal assign PIC.");
//   } finally {
//     setIsUpdating(false);
//   }
// };

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "100vh",
//           // marginLeft: "220px",
//         }}
//       >
//         <CircularProgress size={50} />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ display: "flex" }}>
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           p: 3,
//           // marginLeft: "220px",
//           minHeight: "100vh",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         <Typography variant="h5" fontWeight="bold" sx={{ color: "#1976d2", mb: 3 }}>
//           Kalender Request Deployment
//         </Typography>

//         <Paper elevation={3} sx={{ width: "90%", maxWidth: 900, p: 2, borderRadius: 2 }}>
//           <FullCalendar
//             plugins={[dayGridPlugin]}
//             initialView="dayGridMonth"
//             height="80vh"
//             events={calendarEvents}
//             eventDisplay="block"
//             eventContent={(arg) => (
//               <div
//                 style={{
//                   color:
//                     arg.event.extendedProps.riskImpact === "Major Release"
//                       ? "#fff"
//                       : "#000",
//                 }}
//               >
//                 {arg.event.title}
//               </div>
//             )}
//             eventBorderColor="#00000030"
//             displayEventTime={false}
//             eventClick={handleEventClick}
//             eventDidMount={(info) => {
//               info.el.style.padding = "4px 6px";
//               info.el.style.borderRadius = "4px";
//               info.el.style.fontWeight = "600";
//               info.el.style.textAlign = "center";
//             }}
//           />

//           <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
//             <DialogTitle>Detail Deployment Request</DialogTitle>
//             <DialogContent dividers>
//               {selectedEvent ? (
//                 <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
//                   <Typography>
//                     <strong>Judul:</strong> {selectedEvent.title}
//                   </Typography>
//                   <Typography>
//                     <strong>Aplikasi:</strong> {selectedEvent.applicationName}
//                   </Typography>
//                   <Typography>
//                     <strong>Tanggal Implementasi:</strong> {selectedEvent.implementDate}
//                   </Typography>
//                   <Typography>
//                     <strong>Risk Impact:</strong> {selectedEvent.riskImpact}
//                   </Typography>

//                   {role === "SQI" && (
//                     <FormControl size="small" sx={{ mt: 1, width: "100%" }}>
//                       <InputLabel id="sqi-pic-label">Assign SQI PIC</InputLabel>
//                       <Select
//                         labelId="sqi-pic-label"
//                         value={selectedPic}
//                         onChange={handleAssignPic}
//                         label="Assign SQI PIC"
//                       >
//                         {sqiPics.map((pic) => (
//                           <MenuItem key={pic.id} value={pic.id}>
//                             {pic.name}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   )}
//                 </Box>
//               ) : (
//                 <Typography>Tidak ada data.</Typography>
//               )}
//             </DialogContent>

//             <DialogActions>
//               {selectedEvent?.attachment && (
//                 <Button
//                   variant="outlined"
//                   color="primary"
//                   size="small"
//                   startIcon={<DownloadIcon />}
//                   onClick={handleDownload}
//                   sx={{ textTransform: "none", fontWeight: 500 }}
//                 >
//                   Download
//                 </Button>
//               )}

//               {role === "SQI" && (
//                 <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
//                   <InputLabel id="status-label">Status</InputLabel>
//                   <Select
//                     labelId="status-label"
//                     value={selectedStatus}
//                     onChange={handleStatusChange}
//                     label="Status"
//                   >
//                     {statuses.map((status) => (
//                       <MenuItem key={status} value={status}>
//                         {status === "null" ? "-" : status}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               )}

//               <Button onClick={() => setOpenDialog(false)} color="primary">
//                 Tutup
//               </Button>
//             </DialogActions>
//           </Dialog>
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

// export default DeploymentCalendarPage;
