import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`dashboard-main ${sidebarOpen ? 'dashboard-main-shifted' : ''}`}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;