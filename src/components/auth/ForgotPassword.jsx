import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { authAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";

const ForgotPassword = ({ onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(data.email);
      setEmailSent(true);
      toast.showSuccess(
        "Password reset link sent! Check your email for instructions."
      );
    } catch (err) {
      toast.showError(
        err.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-box">
            <h2>✅ Email Sent!</h2>
            <p className="auth-subtitle">
              We've sent a password reset link to your email address.
            </p>
            <p style={{ marginTop: "1rem", color: "#6b7280" }}>
              Please check your inbox and click the link to reset your password.
              The link will expire in 1 hour.
            </p>
            <button
              onClick={onSwitchToLogin}
              className="btn btn-primary"
              style={{ marginTop: "2rem" }}
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
        <h2>🔐 Forgot Password?</h2>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
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
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </div>

          <button
            type="submit"
            aria-label="Send Reset Link"
            disabled={isLoading}
            className="auth-button btn btn-primary"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
