import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authAPI, organizationsAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";

const Register = ({ onSwitchToLogin }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError: setFormError,
  } = useForm();

  const password = watch("password");
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedOrgId = watch("organizationId");

  // Fetch organizations on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgs = await organizationsAPI.getAll();
        setOrganizations(orgs);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        toast.showError("Failed to load organizations");
      }
    };
    fetchOrganizations();
  }, [toast]);

  // Update selected organization when dropdown changes
  useEffect(() => {
    if (watchedOrgId) {
      const org = organizations.find((o) => o._id === watchedOrgId);
      setSelectedOrg(org);
    }
  }, [watchedOrgId, organizations]);

  // Validate email domain against organization domain
  const validateEmailDomain = (email, org) => {
    if (!email || !org || !org.domain) return true;

    const emailDomain = email.split("@")[1]?.toLowerCase();
    const orgDomain = org.domain.toLowerCase();

    return emailDomain === orgDomain;
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Find selected organization
      const organization = organizations.find(
        (o) => o._id === data.organizationId
      );

      if (!organization) {
        toast.showError("Please select an organization");
        setIsLoading(false);
        return;
      }

      // Validate email domain matches organization domain
      if (!validateEmailDomain(data.email, organization)) {
        setFormError("email", {
          type: "manual",
          message: `Email must be from ${organization.domain} domain to join ${organization.name}`,
        });
        toast.showError(
          `Email domain must match ${organization.domain} to join this organization`
        );
        setIsLoading(false);
        return;
      }

      // Register with real API
      const response = await authAPI.register(
        data.name,
        data.email,
        data.password,
        data.organizationId
      );

      // Store auth data
      const authData = {
        token: response.token,
        user: response.user,
        organization: response.user.organization,
      };
      localStorage.setItem("auth", JSON.stringify(authData));

      // Update auth context
      login(response.user, response.user.organization);

      toast.showSuccess(`Welcome to ${organization.name}!`);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      toast.showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{watchedName ? `Welcome, ${watchedName}!` : "Create Account"}</h2>
        <p className="auth-subtitle">
          {watchedName
            ? "Complete your registration below"
            : "Join your organization on TaskFlow"}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              className={errors.name ? "error" : ""}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <span className="field-error">{errors.name.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="organizationId">Organization</label>
            <select
              id="organizationId"
              {...register("organizationId", {
                required: "Please select an organization",
              })}
              className={errors.organizationId ? "error" : ""}
            >
              <option value="">Select your organization</option>
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name} ({org.domain})
                </option>
              ))}
            </select>
            {errors.organizationId && (
              <span className="field-error">
                {errors.organizationId.message}
              </span>
            )}
            {selectedOrg && (
              <small style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                ℹ️ Your email must be from @{selectedOrg.domain} to join this
                organization
              </small>
            )}
          </div>

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
              placeholder={
                selectedOrg
                  ? `yourname@${selectedOrg.domain}`
                  : "Enter your email"
              }
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
            {watchedEmail &&
              selectedOrg &&
              !validateEmailDomain(watchedEmail, selectedOrg) && (
                <span className="field-error">
                  ⚠️ Email must be from @{selectedOrg.domain} domain
                </span>
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
              placeholder="Create a strong password"
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={errors.confirmPassword ? "error" : ""}
              placeholder="Re-enter your password"
            />
            {errors.confirmPassword && (
              <span className="field-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            aria-label="Create Account"
            disabled={isLoading}
            className="auth-button btn btn-primary"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
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

export default Register;
