import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/Sidebar';
import ClassManagement from './ClassManagement';
import GradeInput from './GradeInput';

const TeacherDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<div>Teacher Dashboard Overview</div>} />
        <Route path="/class-management" element={<ClassManagement />} />
        <Route path="/grade-input" element={<GradeInput />} />
      </Routes>
    </DashboardLayout>  
  );
};

export default TeacherDashboard; 