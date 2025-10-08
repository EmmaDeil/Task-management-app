// Get the base URL for API calls
export const getApiBaseUrl = () => {
  return (
    import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"
  );
};

// Get full image URL from relative path or file ID
export const getImageUrl = (pathOrFileId) => {
  if (!pathOrFileId) return null;

  // If it's already a full URL
  if (pathOrFileId.startsWith("http")) return pathOrFileId;

  // If it's a file ID (MongoDB ObjectId format - 24 hex characters)
  if (/^[0-9a-fA-F]{24}$/.test(pathOrFileId)) {
    return `${getApiBaseUrl()}/api/files/${pathOrFileId}`;
  }

  // Legacy: If it's a relative path (starts with /)
  return `${getApiBaseUrl()}${pathOrFileId}`;
};
