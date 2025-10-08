import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import OrganizationSignup from "../components/auth/OrganizationSignup";
import InviteSignup from "../components/auth/InviteSignup";
import ForgotPassword from "../components/auth/ForgotPassword";
import ResetPassword from "../components/auth/ResetPassword";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState("login");

  useEffect(() => {
    // Check URL parameters for specific views
    const inviteCode = searchParams.get("invite");
    const resetToken = searchParams.get("token");

    if (inviteCode) {
      setCurrentView("invite-signup");
    } else if (resetToken) {
      setCurrentView("reset-password");
    }
  }, [searchParams]);

  const renderCurrentView = () => {
    switch (currentView) {
      case "register":
        return <Register onSwitchToLogin={() => setCurrentView("login")} />;
      case "org-signup":
        return (
          <OrganizationSignup onSwitchToLogin={() => setCurrentView("login")} />
        );
      case "invite-signup":
        return <InviteSignup onSwitchToLogin={() => setCurrentView("login")} />;
      case "forgot-password":
        return (
          <ForgotPassword onSwitchToLogin={() => setCurrentView("login")} />
        );
      case "reset-password":
        return (
          <ResetPassword onSwitchToLogin={() => setCurrentView("login")} />
        );
      default:
        return (
          <Login
            onSwitchToRegister={() => setCurrentView("register")}
            onSwitchToOrgSignup={() => setCurrentView("org-signup")}
            onSwitchToForgotPassword={() => setCurrentView("forgot-password")}
          />
        );
    }
  };

  return <div className="auth-page">{renderCurrentView()}</div>;
};

export default AuthPage;
