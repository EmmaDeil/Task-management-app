# Migration Guide: Local Files → MongoDB Storage

## Overview
This guide helps migrate existing local file uploads to MongoDB-based storage.

---

## 🔄 What Changed

### Before (Local Storage):
```
/server/uploads/
  ├── avatar-1234567890.png
  ├── avatar-9876543210.jpg
  └── document-1357924680.pdf
```
- Files stored on disk
- Paths stored in database: `/uploads/avatar-1234567890.png`
- Accessed via static file serving
- Separate backup required

### After (MongoDB Storage):
```
MongoDB File Collection:
{
  _id: ObjectId("..."),
  filename: "1234567890-profile.png",
  originalName: "profile.png",
  mimeType: "image/png",
  size: 51200,
  data: "iVBORw0KGgoAAAANSUhEUgAA..." (base64),
  uploadedBy: ObjectId("..."),
  organization: ObjectId("..."),
  fileType: "avatar"
}
```
- Files stored in MongoDB
- File IDs stored in database: `ObjectId("...")`
- Accessed via API endpoint: `/api/files/:id`
- Automatic MongoDB backup

---

## 📋 Migration Steps

### Step 1: Update User Avatars

If you have existing users with local avatar paths:

```javascript
// Migration script: migrate-avatars.js
const mongoose = require("mongoose");
const User = require("./server/models/User.cjs");
const File = require("./server/models/File.cjs");
const fs = require("fs");
const path = require("path");

async function migrateAvatars() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find users with local avatar paths
  const users = await User.find({
    avatar: { $regex: /^\/uploads\// }
  });
  
  console.log(`Found ${users.length} users with local avatars`);
  
  for (const user of users) {
    try {
      // Read file from disk
      const filePath = path.join(__dirname, "server", user.avatar);
      
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        continue;
      }
      
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString("base64");
      const stats = fs.statSync(filePath);
      
      // Get mime type
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
      };
      const mimeType = mimeTypes[ext] || "application/octet-stream";
      
      // Create file document in MongoDB
      const file = await File.create({
        filename: path.basename(filePath),
        originalName: path.basename(filePath),
        mimeType: mimeType,
        size: stats.size,
        data: base64Data,
        uploadedBy: user._id,
        organization: user.organization,
        fileType: "avatar",
      });
      
      // Update user avatar to file ID
      user.avatar = file._id.toString();
      await user.save();
      
      console.log(`✅ Migrated avatar for ${user.email}`);
    } catch (error) {
      console.error(`❌ Error migrating ${user.email}:`, error.message);
    }
  }
  
  console.log("Migration complete!");
  process.exit(0);
}

migrateAvatars();
```

**Run migration:**
```bash
cd server
node migrate-avatars.js
```

---

### Step 2: Test File Access

After migration, verify files are accessible:

```javascript
// Test script: test-file-access.js
const axios = require("axios");

async function testFileAccess() {
  const token = "YOUR_AUTH_TOKEN"; // Get from login
  
  try {
    // Get user profile
    const userResponse = await axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const avatar = userResponse.data.avatar;
    console.log("Avatar ID:", avatar);
    
    // Try to access avatar
    const fileResponse = await axios.get(
      `http://localhost:5000/api/files/${avatar}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "arraybuffer",
      }
    );
    
    console.log("✅ File accessible");
    console.log("Content-Type:", fileResponse.headers["content-type"]);
    console.log("Size:", fileResponse.data.length, "bytes");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testFileAccess();
```

---

### Step 3: Update Frontend References

The frontend is already updated to handle both:
- **Old format**: `/uploads/avatar.png` (legacy paths)
- **New format**: `ObjectId("...")` (MongoDB file IDs)

The `getImageUrl()` utility automatically detects the format:

```javascript
// utils/imageUtils.js
export const getImageUrl = (pathOrFileId) => {
  // MongoDB ObjectId (24 hex characters)
  if (/^[0-9a-fA-F]{24}$/.test(pathOrFileId)) {
    return `${API_URL}/api/files/${pathOrFileId}`;
  }
  
  // Legacy path
  return `${API_URL}${pathOrFileId}`;
};
```

**No frontend changes needed!**

---

### Step 4: Clean Up Local Files (Optional)

After successful migration and testing:

```bash
# Backup first!
cp -r server/uploads server/uploads-backup

# Remove uploaded files (keep the directory)
rm -rf server/uploads/*
```

---

## 🔧 Configuration Changes

### server/.env
No changes needed! The existing configuration works.

### API Changes
- ✅ Old endpoint still works: `POST /api/users/upload-avatar`
- ✅ New endpoint available: `POST /api/files/upload`
- ✅ File retrieval: `GET /api/files/:id`

---

## 🎯 Upload Flow Comparison

### Old Flow:
```javascript
// 1. Upload to disk
const formData = new FormData();
formData.append("avatar", file);
await api.post("/users/upload-avatar", formData);

// 2. Path stored: "/uploads/avatar-123.png"
// 3. Display: <img src={getImageUrl(user.avatar)} />
```

### New Flow:
```javascript
// 1. Upload to MongoDB
const formData = new FormData();
formData.append("file", file);
formData.append("fileType", "avatar");
const result = await filesAPI.upload(file, "avatar");

// 2. File ID stored: "507f1f77bcf86cd799439011"
// 3. Update user avatar
await usersAPI.uploadAvatar(result.id);

// 4. Display: <img src={getImageUrl(user.avatar)} />
//    → Auto-detects ObjectId format
//    → Generates: "/api/files/507f1f77bcf86cd799439011"
```

---

## 📊 Storage Comparison

### Local Storage:
```
Pros:
- Simple file access
- No database size increase
- Standard file operations

Cons:
- Separate backup required
- Not scalable horizontally
- File permissions issues
- Path management
```

### MongoDB Storage:
```
Pros:
- Single backup solution
- Horizontally scalable
- Access control via API
- Organization scoping
- Automatic indexes

Cons:
- 16MB limit per document (use GridFS for larger)
- Slightly slower than disk
- Increases database size
```

---

## 🔒 Security Improvements

### Before:
- Files accessible via URL if path known
- Limited access control
- No organization scoping

### After:
- ✅ Authentication required
- ✅ Organization-scoped access
- ✅ User permissions checked
- ✅ Automatic audit trail (uploadedBy, timestamps)

---

## 🚀 Performance Considerations

### File Size Limits:
- **Current**: 5MB (set in `server/routes/files.cjs`)
- **MongoDB Limit**: 16MB per document
- **For larger files**: Consider GridFS

### Optimization Tips:
1. **Image Compression**: Compress before upload
2. **Lazy Loading**: Load images on demand
3. **Caching**: Enable browser cache headers
4. **CDN**: Consider CDN for production

### Example: Image Compression
```javascript
// Frontend: Before upload
import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 800,
  useWebWorker: true,
};

const compressedFile = await imageCompression(file, options);
await filesAPI.upload(compressedFile, "avatar");
```

---

## 🧪 Testing Checklist

After migration:
- [ ] Existing avatars display correctly
- [ ] New avatar uploads work
- [ ] File download works
- [ ] File deletion works
- [ ] Organization isolation works
- [ ] Old local files backed up
- [ ] Database backup includes files
- [ ] Performance acceptable

---

## 🐛 Troubleshooting

### Issue: "File too large"
```
Solution: Either compress file or increase limit:
// server/routes/files.cjs
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
```

### Issue: "Avatar not displaying"
```
Solution: Check if avatar field is ObjectId or path:
console.log(user.avatar); // Should be 24-char hex
```

### Issue: "MongoDB document too large"
```
Error: Document exceeds 16MB
Solution: Use GridFS for large files or reduce file size
```

### Issue: "Slow file loading"
```
Solutions:
1. Add indexes to File collection
2. Implement caching
3. Use CDN for production
4. Compress images before upload
```

---

## 🎉 Migration Complete!

After following this guide:
- ✅ All files stored in MongoDB
- ✅ Secure access control
- ✅ Organization scoping
- ✅ Single backup solution
- ✅ Ready for horizontal scaling

**Next Steps:**
1. Monitor database size
2. Set up regular backups
3. Implement CDN (optional)
4. Add image compression (optional)
