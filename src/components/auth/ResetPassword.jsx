import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";

const ResetPassword = ({ onSwitchToLogin }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const toast = useToast();

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setValidating(false);
        return;
      }

      try {
        await authAPI.validateResetToken(token);
        setTokenValid(true);
      } catch {
        setTokenValid(false);
        toast.showError("Invalid or expired reset link");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, toast]);

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await authAPI.resetPassword(token, data.password);

      toast.showSuccess("Password reset successful! Logging you in...");

      // Auto-login after password reset
      const authData = {
        token: response.token,
        user: response.user,
        organization: response.user.organization,
      };
      localStorage.setItem("auth", JSON.stringify(authData));
      login(response.user, response.user.organization);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      toast.showError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
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
            <p>Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="error-box">
            <h2>❌ Invalid Reset Link</h2>
            <p className="error-message">
              This password reset link is invalid or has expired. Reset links
              are valid for 1 hour.
            </p>
            <button
              onClick={onSwitchToLogin}
              className="btn btn-primary"
              style={{ marginTop: "1.5rem" }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔑 Reset Password</h2>
        <p className="auth-subtitle">
          Enter your new password below. Make sure it's strong and secure.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
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
              placeholder="Enter new password"
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={errors.confirmPassword ? "error" : ""}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <span className="field-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            aria-label="Reset Password"
            disabled={isLoading}
            className="auth-button btn btn-primary"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Remember your password?
            <button onClick={onSwitchToLogin} className="link-button">
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
