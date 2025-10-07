/**
 * Standard error handler for the application
 * Provides consistent error messages and logging
 */

export const handleError = (error, context = "") => {
  console.error(`[Error${context ? ` - ${context}` : ""}]:`, error);

  // Extract error message from different error formats
  let message = "An unexpected error occurred. Please try again.";

  if (error.response) {
    // API error response
    message =
      error.response.data?.message || error.response.data?.error || message;
  } else if (error.message) {
    // JavaScript error
    message = error.message;
  } else if (typeof error === "string") {
    // String error
    message = error;
  }

  return message;
};

/**
 * Standard success messages
 */
export const successMessages = {
  // User actions
  profileUpdated: "Profile updated successfully!",
  profilePictureUpdated: "Profile picture updated successfully!",
  passwordChanged: "Password changed successfully!",
  settingsSaved: "Settings saved successfully!",
  accountDeleted: "Your account has been permanently deleted.",

  // Task actions
  taskCreated: "Task created successfully!",
  taskUpdated: "Task updated successfully!",
  taskDeleted: "Task deleted successfully!",
  taskMoved: "Task moved successfully!",

  // Project actions
  projectCreated: "Project created successfully!",
  projectUpdated: "Project updated successfully!",
  projectDeleted: "Project deleted successfully!",

  // User management
  userInvited: "Invitation sent successfully!",
  userUpdated: "User updated successfully!",
  userDeactivated: "Users deactivated successfully!",
  userRemoved: "Users removed successfully!",
  inviteCopied: "Invite link copied to clipboard!",

  // Organization
  organizationUpdated: "Organization settings saved successfully!",
};

/**
 * Standard error messages
 */
export const errorMessages = {
  // Generic
  generic: "An unexpected error occurred. Please try again.",
  network: "Network error. Please check your connection and try again.",
  unauthorized: "You are not authorized to perform this action.",
  notFound: "The requested resource was not found.",

  // User actions
  profileUpdateFailed: "Failed to update profile. Please try again.",
  profilePictureUploadFailed:
    "Failed to upload profile picture. Please try again.",
  passwordChangeFailed: "Failed to change password. Please try again.",
  settingsSaveFailed: "Failed to save settings. Please try again.",
  accountDeleteFailed: "Failed to delete account. Please try again.",

  // Validation
  fileTooLarge: "File size must be less than 5MB",
  invalidFileType: "Please select an image file",
  passwordMismatch: "New passwords do not match!",
  passwordTooShort: "New password must be at least 6 characters!",
  passwordRequired: "Please enter your password to confirm account deletion.",
  fieldsRequired: "Please fill in all required fields",

  // Task actions
  taskCreateFailed: "Failed to create task. Please try again.",
  taskUpdateFailed: "Failed to update task. Please try again.",
  taskDeleteFailed: "Failed to delete task. Please try again.",
  taskMoveFailed: "Failed to move task. Please try again.",
  taskLoadFailed: "Failed to load tasks. Please refresh the page.",

  // Project actions
  projectCreateFailed: "Failed to create project. Please try again.",
  projectUpdateFailed: "Failed to update project. Please try again.",
  projectDeleteFailed: "Failed to delete project. Please try again.",
  projectLoadFailed: "Failed to load projects. Please refresh the page.",

  // User management
  userUpdateFailed: "Failed to update user status. Please try again.",
  userActionFailed: "Failed to perform action on users. Please try again.",

  // Organization
  organizationUpdateFailed: "Failed to save settings. Please try again.",
};

/**
 * Warning messages
 */
export const warningMessages = {
  twoFactorNotImplemented:
    "Two-Factor Authentication setup will be implemented in a future update. This feature will add an extra layer of security to your account.",
};
