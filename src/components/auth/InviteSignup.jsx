import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { invitesAPI } from "../../services/api";

const InviteSignup = ({ onSwitchToLogin }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteData, setInviteData] = useState(null);
  const [validating, setValidating] = useState(true);

  const inviteCode = searchParams.get("invite");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const validateInvite = async () => {
      if (!inviteCode) {
        setError("No invitation code provided");
        setValidating(false);
        return;
      }

      try {
        const response = await invitesAPI.validate(inviteCode);
        setInviteData(response);
        setValidating(false);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Invalid or expired invitation. Please contact your administrator."
        );
        setValidating(false);
      }
    };

    validateInvite();
  }, [inviteCode]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await invitesAPI.accept(inviteCode, {
        name: data.name,
        password: data.password,
      });

      // Store auth data with token
      const authData = {
        token: response.token,
        user: response.user,
        organization: response.user.organization,
      };
      localStorage.setItem("auth", JSON.stringify(authData));

      // Update auth context
      login(response.user, response.user.organization);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to accept invitation. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Validating invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !inviteData) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="error-box">
            <h2>❌ Invalid Invitation</h2>
            <p className="error-message">{error}</p>
            <button onClick={onSwitchToLogin} className="btn btn-primary">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="invite-header">
          <h2>🎉 You're Invited!</h2>
          <p className="auth-subtitle">
            Join <strong>{inviteData.organization.name}</strong> on TaskFlow
          </p>
        </div>

        <div className="invite-info-box">
          <p>
            <strong>Email:</strong> {inviteData.email}
          </p>
          <p>
            <strong>Role:</strong>{" "}
            <span className="badge">{inviteData.role}</span>
          </p>
          <p>
            <strong>Organization:</strong> {inviteData.organization.name}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

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
              placeholder="Create a password"
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
                validate: (value, formValues) =>
                  value === formValues.password || "Passwords do not match",
              })}
              className={errors.confirmPassword ? "error" : ""}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <span className="field-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            aria-label="Accept Invitation"
            disabled={isLoading}
            className="auth-button btn btn-primary"
          >
            {isLoading ? "Creating Account..." : "Accept Invitation & Sign Up"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account?
            <button onClick={onSwitchToLogin} className="link-button">
              Sign in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteSignup;
