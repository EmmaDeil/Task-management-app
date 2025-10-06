import React, { useState } from "react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import OrganizationSignup from "../components/auth/OrganizationSignup";

const AuthPage = () => {
  const [currentView, setCurrentView] = useState("login");

  const renderCurrentView = () => {
    switch (currentView) {
      case "register":
        return <Register onSwitchToLogin={() => setCurrentView("login")} />;
      case "org-signup":
        return (
          <OrganizationSignup onSwitchToLogin={() => setCurrentView("login")} />
        );
      default:
        return (
          <Login
            onSwitchToRegister={() => setCurrentView("register")}
            onSwitchToOrgSignup={() => setCurrentView("org-signup")}
          />
        );
    }
  };

  return <div className="auth-page">{renderCurrentView()}</div>;
};

export default AuthPage;
