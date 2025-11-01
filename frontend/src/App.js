import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import TaskListPage from "./pages/TaskListPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import MainLayout from "./layout/MainLayout";
import DeploymentCalendarPage from "./pages/DeploymentCalendarPage"; // Import halaman kalender
import CreateDeploymentRequestPage from "./pages/CreateDeploymentRequestPage"; // Import halaman form request deployment
const App = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainLayout>
                <TaskListPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainLayout>
                <CreateTaskPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Halaman Request Deployment - hanya untuk developer */}
        <Route
          path="/request-deployment"
          element={
            isAuthenticated ? (
              <MainLayout>
                <CreateDeploymentRequestPage />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Halaman Kalender Deployment */}
        <Route
          path="/deployment-calendar"
          element={
            isAuthenticated ? (
              <MainLayout>
                <DeploymentCalendarPage />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/" element={<Navigate to="/tasks" />} />
      </Routes>
    </Router>
  );
};

export default App;
