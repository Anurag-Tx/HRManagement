import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import JobDescriptions from './pages/JobDescriptions';
import CVReview from './components/CVReview';
import NotFound from './pages/NotFound';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/job-descriptions" element={<JobDescriptions />} />
      <Route path="/cv-review/:id" element={<CVReview />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 