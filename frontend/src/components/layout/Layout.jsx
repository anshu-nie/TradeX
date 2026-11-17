import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const toggleMobileSidebar = () => setMobileOpen((prev) => !prev);
  const closeMobileSidebar = () => setMobileOpen(false);

  return (
    <div className="app-container">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        mobileOpen={mobileOpen}
        closeMobileSidebar={closeMobileSidebar}
      />

      <div className={`main-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar
          toggleMobileSidebar={toggleMobileSidebar}
          toggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
