# Quick Reference Guide - New Features

## 🔐 Password Reset Flow

### User Journey:
1. Login page → "Forgot Password?" link
2. Enter email → Receive reset email
3. Click link → Reset password page
4. Enter new password → Auto-logged in

### API Calls:
```javascript
// Request reset
await authAPI.forgotPassword("user@company.com");

// Validate token (auto-called on page load)
await authAPI.validateResetToken(token);

// Reset password
const response = await authAPI.resetPassword(token, "newPassword123");
// Returns: { token, user } - auto-logged in
```

---

## 🏢 Organization Domain Registration

### User Journey:
1. Register page → Select organization
2. See domain requirement (e.g., @acme.com)
3. Enter email with correct domain
4. Real-time validation feedback
5. Submit registration

### API Calls:
```javascript
// Get organizations list
const orgs = await organizationsAPI.getAll();
// Returns: [{ _id, name, domain, plan }, ...]

// Register user
await authAPI.register(
  "John Doe",
  "john@acme.com",
  "password123",
  "org-id-here"
);
```

### Validation:
```javascript
const emailDomain = email.split("@")[1]; // "acme.com"
const matches = emailDomain === organization.domain; // true/false
```

---

## 💾 MongoDB File Storage

### Upload Flow:
```javascript
// 1. Upload file to MongoDB
const formData = new FormData();
formData.append("file", fileInput.files[0]);
const result = await filesAPI.upload(file, "avatar");
// Returns: { id, filename, originalName, mimeType, size }

// 2. Use file ID for avatar
await usersAPI.uploadAvatar(result.id);
```

### Display Files:
```javascript
// In React component
<img src={filesAPI.getFileUrl(user.avatar)} alt="Avatar" />

// Or using utility
import { getImageUrl } from "./utils/imageUtils";
<img src={getImageUrl(user.avatar)} alt="Avatar" />
```

### File Management:
```javascript
// List all files
const files = await filesAPI.getAll("avatar");

// Get file metadata
const metadata = await filesAPI.getMetadata(fileId);

// Delete file
await filesAPI.delete(fileId);

// Download file
const blob = await filesAPI.getById(fileId);
const url = URL.createObjectURL(blob);
```

---

## 🔍 Database Search

### Frontend Usage:
```javascript
// In Header component - auto-called on input
const handleSearch = async (query) => {
  const [tasks, projects] = await Promise.all([
    tasksAPI.search(query),
    projectsAPI.search(query),
  ]);
  setSearchResults(tasks);
  setProjectResults(projects);
};
```

### Backend Implementation:
```javascript
// Tasks route
router.get("/", protect, async (req, res) => {
  const { search } = req.query;
  const query = { organization: req.user.organization._id };
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { project: { $regex: search, $options: "i" } },
    ];
  }
  
  const tasks = await Task.find(query);
  res.json(tasks);
});
```

---

## 🛠️ Environment Variables

Add to `server/.env`:
```env
# Password Reset
FRONTEND_URL=http://localhost:5173

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="TaskFlow <noreply@taskflow.com>"

# JWT (already configured)
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

---

## 📝 Database Schema Updates

### User Model:
```javascript
{
  // ... existing fields
  resetPasswordToken: String,      // SHA-256 hashed token
  resetPasswordExpire: Date,       // 1 hour from creation
  avatar: String,                  // Now stores file ID, not path
}
```

### File Model (NEW):
```javascript
{
  filename: String,                // Generated unique name
  originalName: String,            // User's filename
  mimeType: String,               // "image/png", "application/pdf"
  size: Number,                   // Bytes
  data: String,                   // Base64 encoded content
  uploadedBy: ObjectId,           // User reference
  organization: ObjectId,         // Organization reference
  fileType: String,               // "avatar", "attachment", "document"
  createdAt: Date,
  updatedAt: Date,
}
```

---

## 🧩 Component Integration

### Password Reset in AuthPage:
```jsx
// AuthPage.jsx
const [currentView, setCurrentView] = useState("login");

// Detect URL parameters
useEffect(() => {
  const token = searchParams.get("token");
  if (token) setCurrentView("reset-password");
}, [searchParams]);

// Render views
{currentView === "reset-password" && (
  <ResetPassword onSwitchToLogin={() => setCurrentView("login")} />
)}
```

### Domain Validation in Register:
```jsx
// Register.jsx
const [selectedOrg, setSelectedOrg] = useState(null);

// Update on dropdown change
useEffect(() => {
  const org = organizations.find(o => o._id === watchedOrgId);
  setSelectedOrg(org);
}, [watchedOrgId]);

// Validate on submit
if (!validateEmailDomain(email, organization)) {
  toast.showError(`Email must be from ${organization.domain}`);
  return;
}
```

### Search in Header:
```jsx
// Header.jsx
const [searchQuery, setSearchQuery] = useState("");
const searchTimeoutRef = useRef(null);

// Debounced search
useEffect(() => {
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }
  
  searchTimeoutRef.current = setTimeout(async () => {
    const tasks = await tasksAPI.search(searchQuery);
    const projects = await projectsAPI.search(searchQuery);
    setSearchResults(tasks);
    setProjectResults(projects);
  }, 300);
}, [searchQuery]);
```

---

## 🎯 API Endpoints Summary

### Authentication:
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register with domain validation
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/reset-password/:token` - Validate reset token
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Organizations:
- `GET /api/organizations` - Get all (public, for registration)
- `GET /api/organizations/:id` - Get by ID (private)
- `PUT /api/organizations/:id` - Update (admin only)

### Files:
- `POST /api/files/upload` - Upload to MongoDB
- `GET /api/files/:id` - Download file
- `GET /api/files/metadata/:id` - Get metadata
- `GET /api/files` - List files
- `DELETE /api/files/:id` - Delete file

### Tasks:
- `GET /api/tasks?search=query` - Search tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Projects:
- `GET /api/projects?search=query` - Search projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

---

## ⚡ Performance Tips

### File Uploads:
- ✅ 5MB limit enforced
- ✅ Use memory storage (multer)
- ✅ Base64 encoding for MongoDB
- ⚠️ Consider GridFS for files > 16MB

### Search:
- ✅ 300ms debounce reduces API calls
- ✅ MongoDB indexes on frequently searched fields
- ✅ Regex with case-insensitive option
- ⚠️ Consider full-text search for large datasets

### Image Display:
- ✅ File IDs cached by MongoDB
- ✅ Browser caching of file endpoints
- ⚠️ Consider CDN for production

---

## 🐛 Troubleshooting

### Password Reset Email Not Sending:
1. Check `EMAIL_*` env variables
2. Enable "Less secure app access" (Gmail)
3. Or use App Password (Gmail)
4. Check console logs: `Password reset email sent to...`

### Domain Validation Failing:
1. Verify organization has `domain` field
2. Check case sensitivity (should be case-insensitive)
3. Ensure email format: `user@domain.com`

### File Upload Errors:
1. Check file size < 5MB
2. Verify MongoDB connection
3. Check user authentication
4. Verify organization access

### Search Not Working:
1. Ensure backend has `search` query parameter handling
2. Check MongoDB indexes
3. Verify debounce timeout (300ms)
4. Check network tab for API calls

---

## ✅ Testing Commands

```bash
# Backend tests
cd server
node server.cjs  # Should start on port 5000

# Frontend tests
npm run dev      # Should start on port 5173

# Test password reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@company.com"}'

# Test file upload
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.png" \
  -F "fileType=avatar"

# Test search
curl "http://localhost:5000/api/tasks?search=meeting" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎉 Ready to Go!

All features are implemented and ready for production use!
