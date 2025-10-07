const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db.cjs");

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, ".env") });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth.cjs"));
app.use("/api/tasks", require("./routes/tasks.cjs"));
app.use("/api/organizations", require("./routes/organizations.cjs"));
app.use("/api/users", require("./routes/users.cjs"));
app.use("/api/notifications", require("./routes/notifications.cjs"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
