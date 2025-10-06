import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";

const Login = ({ onSwitchToRegister, onSwitchToOrgSignup }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Determine user role and organization based on email
      let userRole = "member";
      let orgName = "Demo Organization";
      
      if (data.email === "admin@demo.com") {
        userRole = "admin";
        orgName = "TechCorp Solutions";
      } else if (data.email === "manager@demo.com") {
        userRole = "manager";
        orgName = "Creative Agency";
      }

      const mockUser = {
        id: Date.now(),
        email: data.email,
        name: data.email.split("@")[0],
        role: userRole,
      };

      const mockOrganization = {
        id: 1,
        name: orgName,
        plan: "pro",
        domain: orgName.toLowerCase().replace(/\s+/g, '-')
      };

      login(mockUser, mockOrganization);
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoType) => {
    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const demoAccounts = {
        admin: {
          user: {
            id: 1,
            email: "admin@demo.com",
            name: "Admin User",
            role: "admin",
          },
          organization: {
            id: 1,
            name: "TechCorp Solutions",
            plan: "enterprise",
            domain: "techcorp-solutions"
          }
        },
        manager: {
          user: {
            id: 2,
            email: "manager@demo.com",
            name: "Project Manager",
            role: "manager",
          },
          organization: {
            id: 2,
            name: "Creative Agency",
            plan: "pro",
            domain: "creative-agency"
          }
        },
        member: {
          user: {
            id: 3,
            email: "member@demo.com",
            name: "Team Member",
            role: "member",
          },
          organization: {
            id: 3,
            name: "Startup Hub",
            plan: "free",
            domain: "startup-hub"
          }
        }
      };

      const demoAccount = demoAccounts[demoType];
      login(demoAccount.user, demoAccount.organization);
    } catch {
      setError("Demo login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign In</h2>
        <p className="auth-subtitle">Welcome back to TaskFlow</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              className={errors.email ? "error" : ""}
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={errors.password ? "error" : ""}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            aria-label="Sign In"
            disabled={isLoading}
            className="auth-button btn btn-primary"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-title">Try Demo Accounts:</p>
          <div className="demo-buttons">
            <button 
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className="btn demo-btn admin"
            >
              Admin Demo
            </button>
            <button 
              type="button"
              onClick={() => handleDemoLogin('manager')}
              disabled={isLoading}
              className="btn demo-btn manager"
            >
              Manager Demo
            </button>
            <button 
              type="button"
              onClick={() => handleDemoLogin('member')}
              disabled={isLoading}
              className="btn demo-btn member"
            >
              Member Demo
            </button>
          </div>
          <p className="demo-info">No registration required - explore all features!</p>
        </div>

        <div className="auth-links">
          <p>
            Don't have an account?
            <button onClick={onSwitchToRegister} className="link-button">
              Sign up
            </button>
          </p>
          <p>
            Need to create an organization?
            <button onClick={onSwitchToOrgSignup} className="link-button">
              Create Organization
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
