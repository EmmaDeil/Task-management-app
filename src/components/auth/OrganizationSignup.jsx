import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authAPI } from "../../services/api";

const OrganizationSignup = ({ onSwitchToLogin }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: org details, 2: admin user

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("adminPassword");
  const organizationName = watch("organizationName");

  // Generate domain preview
  const getDomainPreview = () => {
    if (!organizationName) return "";
    return organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      // Generate domain from organization name
      const domain = data.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      // Call the real API
      const response = await authAPI.registerOrganization(
        data.organizationName,
        domain,
        data.adminName,
        data.adminEmail,
        data.adminPassword,
        data.plan
      );

      // Store token
      localStorage.setItem("token", response.token);

      // Update auth context with user and organization data
      login(response.user, response.user.organization);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Handle specific error messages from backend
      const errorMessage =
        err.response?.data?.message ||
        "Failed to create organization. Please try again.";

      setError(errorMessage);

      // If organization domain is taken, suggest going back to step 1
      if (errorMessage.includes("domain")) {
        setStep(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card large">
        <h2>Create Organization</h2>
        <p className="auth-subtitle">Set up your team workspace</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {step === 1 && (
            <>
              <div className="form-group">
                <label htmlFor="organizationName">Organization Name</label>
                <input
                  type="text"
                  id="organizationName"
                  {...register("organizationName", {
                    required: "Organization name is required",
                    minLength: {
                      value: 2,
                      message:
                        "Organization name must be at least 2 characters",
                    },
                    maxLength: {
                      value: 50,
                      message:
                        "Organization name must not exceed 50 characters",
                    },
                  })}
                  className={errors.organizationName ? "error" : ""}
                  placeholder="e.g., Acme Corporation"
                />
                {errors.organizationName && (
                  <span className="field-error">
                    {errors.organizationName.message}
                  </span>
                )}
                {organizationName && getDomainPreview() && (
                  <small
                    style={{
                      color: "var(--text-secondary)",
                      marginTop: "0.5rem",
                      display: "block",
                    }}
                  >
                    Domain: <strong>{getDomainPreview()}</strong>
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="plan">Plan</label>
                <select
                  id="plan"
                  {...register("plan", { required: "Please select a plan" })}
                  className={errors.plan ? "error" : ""}
                >
                  <option value="">Select a plan</option>
                  <option value="free">Free (Up to 5 users)</option>
                  <option value="pro">Pro (Up to 50 users)</option>
                  <option value="enterprise">Enterprise (Unlimited)</option>
                </select>
                {errors.plan && (
                  <span className="field-error">{errors.plan.message}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="auth-button primary"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h3>Admin Account</h3>

              <div className="form-group">
                <label htmlFor="adminName">Admin Name</label>
                <input
                  type="text"
                  id="adminName"
                  {...register("adminName", {
                    required: "Admin name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                    maxLength: {
                      value: 50,
                      message: "Name must not exceed 50 characters",
                    },
                  })}
                  className={errors.adminName ? "error" : ""}
                  placeholder="Your full name"
                />
                {errors.adminName && (
                  <span className="field-error">
                    {errors.adminName.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="adminEmail">Admin Email</label>
                <input
                  type="email"
                  id="adminEmail"
                  {...register("adminEmail", {
                    required: "Admin email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={errors.adminEmail ? "error" : ""}
                  placeholder="admin@example.com"
                />
                {errors.adminEmail && (
                  <span className="field-error">
                    {errors.adminEmail.message}
                  </span>
                )}
                <small
                  style={{
                    color: "var(--text-secondary)",
                    marginTop: "0.5rem",
                    display: "block",
                  }}
                >
                  This email will be used to sign in as the organization
                  administrator.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="adminPassword">Password</label>
                <input
                  type="password"
                  id="adminPassword"
                  {...register("adminPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        "Password must contain uppercase, lowercase, and number",
                    },
                  })}
                  className={errors.adminPassword ? "error" : ""}
                  placeholder="••••••••"
                />
                {errors.adminPassword && (
                  <span className="field-error">
                    {errors.adminPassword.message}
                  </span>
                )}
                <small
                  style={{
                    color: "var(--text-secondary)",
                    marginTop: "0.5rem",
                    display: "block",
                  }}
                >
                  Must be at least 8 characters with uppercase, lowercase, and a
                  number.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmAdminPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmAdminPassword"
                  {...register("confirmAdminPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  className={errors.confirmAdminPassword ? "error" : ""}
                />
                {errors.confirmAdminPassword && (
                  <span className="field-error">
                    {errors.confirmAdminPassword.message}
                  </span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="auth-button secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-button primary"
                >
                  {isLoading
                    ? "Creating organization..."
                    : "Create Organization"}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="auth-links">
          <p>
            Already have an account?
            <button onClick={onSwitchToLogin} className="link-button">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSignup;
