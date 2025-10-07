// Get the base URL for API calls
export const getApiBaseUrl = () => {
  return (
    import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"
  );
};

// Get full image URL from relative path
export const getImageUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith("http")) return relativePath;
  return `${getApiBaseUrl()}${relativePath}`;
};
