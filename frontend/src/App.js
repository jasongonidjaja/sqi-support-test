import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import TaskListPage from "./pages/TaskListPage";
import CreateTaskPage from "./pages/CreateTaskPage";
// import DeploymentCalendarPage from "./pages/DeploymentCalendarPage";
import CreateDeploymentRequestPage from "./pages/CreateDeploymentRequestPage";
import CreateDeploymentSupportPage from "./pages/CreateDeploymentSupportPage";
// import DeploymentCalendarPage2 from "./pages/DeploymentCalendarPage2";
import DeploymentCalendarPage3 from "./pages/DeploymentBoardPage";
import MainLayout from "./layout/MainLayout";
import DeploymentBoardPage from "./pages/DeploymentBoardPage";

const App = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* 🔹 Login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🔒 Protected Routes */}
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

        <Route
          path="/request-deployment"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainLayout>
                <CreateDeploymentRequestPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-deployment-support"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainLayout>
                <CreateDeploymentSupportPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 🔹 Deployment Calendar (3 versi) */}
        {/* <Route
          path="/deployment-calendar"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainLayout>
                <DeploymentCalendarPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/deployment-calendar2"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainLayout>
                <DeploymentCalendarPage2 />
              </MainLayout>
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/deployment-board"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainLayout>
                <DeploymentBoardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 🔹 Default redirect */}
        <Route path="/" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
