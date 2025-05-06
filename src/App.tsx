import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RoleProvider } from './contexts/RoleContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobDescriptions from './pages/JobDescriptions';
import JobDescriptionDetail from './pages/JobDescriptionDetail';
import CVManagement from './pages/CVManagement';
import CVReview from './pages/CVReview';
import NotFound from './pages/NotFound';
import JobDescriptionUpload from './pages/JobDescriptionUpload';
import CVSubmissionPage from './pages/CVSubmissionPage';
import CVReviewList from './pages/CVReviewList';
import InterviewStatus from './pages/InterviewStatus';
import JDListReport from './pages/Reports/JDListReport';
import CVListReport from './pages/Reports/CVListReport';
import InterviewStatusReport from './pages/Reports/InterviewStatusReport';

// Context providers
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <RoleProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer position="top-right" autoClose={5000} />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Protected Routes */}
              <Route element={<Layout />}>
                {/* Common routes for all roles */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/job-descriptions"
                  element={
                    <ProtectedRoute>
                      <JobDescriptions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/job-descriptions/:id"
                  element={
                    <ProtectedRoute>
                      <JobDescriptionDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Manager specific routes */}
                <Route
                  path="/job-descriptions/new"
                  element={
                    <ProtectedRoute requiredRole="Interviewer">
                      <JobDescriptionUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cv-review"
                  element={
                    <ProtectedRoute requiredRole="Interviewer">
                      <CVReviewList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cv-review/:id"
                  element={
                    <ProtectedRoute requiredRole="Interviewer">
                      <CVReview />
                    </ProtectedRoute>
                  }
                />

                {/* HR specific routes */}
                <Route
                  path="/cv-submission"
                  element={
                    <ProtectedRoute requiredRole="HR">
                      <CVSubmissionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview-status"
                  element={
                    <ProtectedRoute requiredRole="HR">
                      <InterviewStatus />
                    </ProtectedRoute>
                  }
                />

                {/* Admin specific routes */}
                <Route
                  path="/reports/jd-list"
                  element={
                    <ProtectedRoute requiredRole="Admin">
                      <JDListReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports/cv-list"
                  element={
                    <ProtectedRoute requiredRole="Admin">
                      <CVListReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports/interview-status"
                  element={
                    <ProtectedRoute requiredRole="Admin">
                      <InterviewStatusReport />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </RoleProvider>
  );
};

export default App;