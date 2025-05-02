import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
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

// Context providers
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer position="top-right" autoClose={5000} />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<Layout />}>
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
                path="/job-descriptions/new"
                element={
                  <ProtectedRoute>
                    <JobDescriptionUpload />
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
              <Route
                path="/cv-management/:jdId"
                element={
                  <ProtectedRoute>
                    <CVManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cv-review"
                element={
                  <ProtectedRoute>
                    <CVReviewList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cv-review/:id"
                element={
                  <ProtectedRoute>
                    <CVReview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cv-submission"
                element={
                  <ProtectedRoute>
                    <CVSubmissionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview-status"
                element={
                  <ProtectedRoute>
                    <InterviewStatus />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;