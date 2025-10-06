import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";

const Layout = ({ children, activeView, onViewChange }) => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // On desktop, keep sidebar open by default
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return <div className="app-container unauthenticated">{children}</div>;
  }

  return (
    <div
      className={`app-container ${
        isSidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      <Header
        onSidebarToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        activeView={activeView}
        onViewChange={onViewChange}
      />

      <main className="main-content">
        <div className="content-wrapper">{children}</div>
      </main>

      {/* Mobile sidebar backdrop */}
      {isMobile && isSidebarOpen && (
        <div className="mobile-backdrop" onClick={handleSidebarClose}></div>
      )}
    </div>
  );
};

export default Layout;
