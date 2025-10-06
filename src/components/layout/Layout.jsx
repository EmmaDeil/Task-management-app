import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";

const Layout = ({ children, activeView, onViewChange }) => {
  const { isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Initialize sidebar state from localStorage or default to false
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // On mobile, always close sidebar
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

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
