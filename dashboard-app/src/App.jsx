import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DepartmentsList from './components/DepartmentsList';
import JobsList from './components/JobsList';
import CandidatesList from './components/CandidatesList';
import EmployeesList from './components/EmployeesList';
import ManagePermissions from './components/ManagePermissions';
import Auth from './components/auth/Auth';
import ResetPassword from './components/auth/ResetPassword';
import PublicCareers from './components/PublicCareers';
import CandidateDashboard from './components/CandidateDashboard';
import CandidateProfile from './components/CandidateProfile';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState({});

  const handleViewChange = (view, params = {}) => {
      setCurrentView(view);
      setViewParams(params);
  };

  if (loading) {
    return <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading application...</div>;
  }

  // Handle password reset route without react-router
  if (window.location.pathname === '/reset-password') {
    return <ResetPassword />;
  }

  if (!user) {
    return <PublicCareers />;
  }

  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super-admin';
  
  const hasPermission = (permissionId) => {
    if (isSuperAdmin) return true;
    if (!isAdmin) return false;
    return (user.permissions || []).includes(permissionId);
  };

  const renderView = () => {
    if (isSuperAdmin) {
      if (currentView === 'permissions') return <ManagePermissions />;
      if (currentView === 'home') return <Dashboard onViewChange={handleViewChange} />;
      if (currentView === 'departments') return <DepartmentsList onViewChange={handleViewChange} />;
      if (currentView === 'jobs') return <JobsList onViewChange={handleViewChange} />;
      if (currentView === 'templates') return <JobsList isTemplateMode={true} onViewChange={handleViewChange} />;
      if (currentView === 'candidates') return <CandidatesList initialDeptId={viewParams.deptId} initialJobId={viewParams.jobId} />;
      if (currentView === 'employees') return <EmployeesList />;
      return <Dashboard onViewChange={handleViewChange} />;
    }

    if (!isAdmin && !isSuperAdmin) {
        // Candidate view
        if (currentView === 'home') return <CandidateDashboard onViewChange={handleViewChange} />;
        if (currentView === 'jobs') return <JobsList isPublicView={true} hideAI={true} onViewChange={handleViewChange} />;
        if (currentView === 'matching') return <JobsList isPublicView={true} hideJobs={true} onViewChange={handleViewChange} />;
        if (currentView === 'profile') return <CandidateProfile />;
        return <CandidateDashboard onViewChange={handleViewChange} />;
    }

    // Recruiters (Admins) logic
    const canView = (module) => hasPermission(`${module}.view`);

    switch (currentView) {
      case 'home':
        return hasPermission('dashboard.view') ? <Dashboard onViewChange={handleViewChange} /> : <Dashboard onViewChange={handleViewChange} />; // Dashboard usually always visible or basic
      case 'departments':
        return canView('departments') ? <DepartmentsList onViewChange={handleViewChange} /> : <div className="loading">Access Denied</div>;
      case 'jobs':
        return canView('jobs') ? <JobsList onViewChange={handleViewChange} /> : <div className="loading">Access Denied</div>;
      case 'templates':
        return canView('jobs') ? <JobsList isTemplateMode={true} onViewChange={handleViewChange} /> : <div className="loading">Access Denied</div>;
      case 'candidates':
        return canView('candidates') ? <CandidatesList initialDeptId={viewParams.deptId} initialJobId={viewParams.jobId} /> : <div className="loading">Access Denied</div>;
      case 'employees':
        // For simplicity, letting all recruiters view employees, or you can add specific permission logic
        return <EmployeesList />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <div className="app-layout">
      <Header onViewChange={handleViewChange} />
      <div className="app-main">
        <Sidebar currentView={currentView} onViewChange={handleViewChange} permissions={user?.permissions || []} isSuperAdmin={isSuperAdmin} isCandidate={!isAdmin && !isSuperAdmin} />
        <div className="scrollable-content">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
