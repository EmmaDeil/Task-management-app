# Organization Signup with MongoDB Integration

## 🎉 Overview

The organization signup feature is now **fully integrated with MongoDB** through the backend API. Organizations and admin users are stored in the database with proper validation and security.

---

## ✨ Features

### 1. **Two-Step Registration Process**

#### **Step 1: Organization Details**
- Organization Name (2-50 characters)
- Plan Selection (Free, Pro, Enterprise)
- Auto-generated domain preview
- Real-time domain validation

#### **Step 2: Admin Account**
- Admin Name (2-50 characters)
- Admin Email (with validation)
- Password (8+ chars with uppercase, lowercase, number)
- Password Confirmation

### 2. **MongoDB Integration**
- ✅ Organizations stored in MongoDB
- ✅ Users stored in MongoDB with hashed passwords
- ✅ Proper relationship between User and Organization
- ✅ JWT authentication tokens
- ✅ Automatic admin role assignment

### 3. **Security Features**
- **Password Hashing**: Passwords encrypted with bcrypt
- **JWT Tokens**: Secure authentication
- **Email Validation**: Proper email format checking
- **Password Requirements**: Strong password policy
- **Duplicate Prevention**: Checks for existing emails/domains

### 4. **Validation & Error Handling**
- Real-time form validation
- Backend validation
- Duplicate email detection
- Duplicate domain detection
- User-friendly error messages

---

## 🔧 Technical Implementation

### Frontend Components

#### **OrganizationSignup.jsx**
```javascript
// Located at: src/components/auth/OrganizationSignup.jsx

Key Features:
- Two-step form with React Hook Form
- Real-time domain generation preview
- Integration with authAPI
- Error handling with user feedback
- Automatic login after successful signup
```

#### **API Service**
```javascript
// Located at: src/services/api.js

authAPI.registerOrganization(
  organizationName,  // "Acme Corporation"
  domain,            // "acme-corporation"
  name,              // "John Doe"
  email,             // "john@acme.com"
  password,          // "SecurePass123"
  plan               // "free", "pro", or "enterprise"
)
```

### Backend Implementation

#### **Route: POST /api/auth/organization/register**
```javascript
// Located at: server/routes/auth.cjs

Request Body:
{
  "organizationName": "Acme Corporation",
  "domain": "acme-corporation",
  "name": "John Doe",
  "email": "john@acme.com",
  "password": "SecurePass123",
  "plan": "free"
}

Response (Success):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@acme.com",
    "role": "admin",
    "organization": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Acme Corporation",
      "domain": "acme-corporation",
      "plan": "free"
    }
  }
}
```

#### **Models**

**Organization Model** (`server/models/Organization.cjs`):
```javascript
{
  name: String (required, unique),
  domain: String (required, unique, lowercase),
  plan: String (enum: ["free", "pro", "enterprise"]),
  settings: {
    allowInvites: Boolean,
    defaultTaskStatus: String
  },
  timestamps: true
}
```

**User Model** (`server/models/User.cjs`):
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  organization: ObjectId (ref: "Organization"),
  role: String (enum: ["admin", "manager", "member"]),
  isActive: Boolean,
  timestamps: true
}
```

---

## 🚀 How to Use

### For Users:

1. **Navigate to Signup**
   - Go to `/auth`
   - Click "Sign up as Organization"

2. **Step 1: Organization Details**
   ```
   Organization Name: Acme Corporation
   Plan: Free (Up to 5 users)
   
   ✓ Auto-generated domain: acme-corporation
   
   Click "Continue"
   ```

3. **Step 2: Admin Account**
   ```
   Admin Name: John Doe
   Admin Email: john@acme.com
   Password: SecurePass123
   Confirm Password: SecurePass123
   
   Click "Create Organization"
   ```

4. **Success!**
   - Organization created in MongoDB
   - Admin user created with hashed password
   - JWT token generated and stored
   - Automatically logged in
   - Redirected to Dashboard

---

## 🔒 Security Measures

### Password Security
```javascript
// Backend: Password hashing with bcrypt
const bcrypt = require('bcryptjs');

// Before saving to database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

### JWT Authentication
```javascript
// Token generation
const token = jwt.sign(
  { id: user._id }, 
  process.env.JWT_SECRET, 
  { expiresIn: '30d' }
);

// Token stored in localStorage
localStorage.setItem('token', token);

// Token sent with every API request
Authorization: Bearer <token>
```

### Validation Rules

**Organization Name:**
- Required
- 2-50 characters
- Auto-converted to domain-safe format

**Domain:**
- Auto-generated from organization name
- Lowercase only
- Special chars replaced with hyphens
- Checked for uniqueness

**Email:**
- Required
- Valid email format
- Checked for uniqueness

**Password:**
- Required
- Minimum 8 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

---

## 📊 Database Schema

### MongoDB Collections

#### **organizations**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Acme Corporation",
  "domain": "acme-corporation",
  "plan": "free",
  "settings": {
    "allowInvites": true,
    "defaultTaskStatus": "todo"
  },
  "createdAt": "2025-10-07T10:30:00Z",
  "updatedAt": "2025-10-07T10:30:00Z"
}
```

#### **users**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@acme.com",
  "password": "$2a$10$encrypted_password_hash",
  "organization": "507f1f77bcf86cd799439012",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-10-07T10:30:00Z",
  "updatedAt": "2025-10-07T10:30:00Z"
}
```

---

## 🐛 Error Handling

### Frontend Error Messages

**Domain Already Taken:**
```
"Organization domain already taken. Please choose a different organization name."
→ Automatically returns to Step 1
```

**Email Already Exists:**
```
"An account with this email already exists. Please use a different email or sign in."
```

**Server Error:**
```
"Server error during organization registration. Please try again."
```

**Validation Errors:**
- Organization name too short/long
- Invalid email format
- Weak password
- Passwords don't match

### Backend Error Responses

```javascript
// 400 Bad Request
{
  "message": "Organization domain already taken"
}

// 400 Bad Request
{
  "message": "User already exists"
}

// 400 Bad Request
{
  "message": "Please provide all required fields"
}

// 500 Server Error
{
  "message": "Server error during organization registration",
  "error": "Detailed error message"
}
```

---

## 🧪 Testing

### Test the Flow

1. **Start Backend Server:**
```bash
cd server
node server.cjs
# Server running on port 5000
# MongoDB Connected
```

2. **Start Frontend:**
```bash
npm run dev
# VITE running on localhost:5174
```

3. **Test Organization Creation:**
```
Navigate to: http://localhost:5174/auth
Click: "Sign up as Organization"

Test Data:
- Org Name: "Test Company"
- Plan: "Free"
- Name: "Test User"
- Email: "test@testcompany.com"
- Password: "TestPass123"
- Confirm: "TestPass123"
```

4. **Verify in MongoDB:**
```bash
# Connect to MongoDB
mongosh <your_connection_string>

# Check organizations
db.organizations.find({ domain: "test-company" })

# Check users
db.users.find({ email: "test@testcompany.com" })
```

### Test Error Cases

**Duplicate Email:**
1. Create an organization
2. Try to create another with same email
3. Should show error message

**Duplicate Domain:**
1. Create organization "Test Company"
2. Try to create "Test Company" again
3. Should show error message

**Invalid Password:**
1. Try password: "weak"
2. Should show validation error

---

## 📈 Next Steps / Enhancements

### Potential Improvements:

1. **Email Verification**
   - Send confirmation email
   - Verify email before activation

2. **Organization Invitations**
   - Generate invite codes
   - Allow admin to invite team members

3. **Plan Management**
   - Upgrade/downgrade plans
   - Payment integration

4. **Organization Settings**
   - Customize organization profile
   - Upload logo
   - Configure preferences

5. **Audit Logging**
   - Track organization creation
   - Log admin actions

6. **Multi-factor Authentication**
   - Optional 2FA for admins
   - Enhanced security

---

## 🎯 Summary

✅ **Fully Functional Organization Signup**
- MongoDB integration complete
- Two-step registration process
- Secure password hashing
- JWT authentication
- Proper error handling
- User-friendly interface

✅ **Security**
- Passwords hashed with bcrypt
- JWT tokens for authentication
- Email validation
- Strong password requirements
- Duplicate prevention

✅ **User Experience**
- Clear two-step process
- Real-time domain preview
- Helpful error messages
- Auto-login after signup
- Smooth navigation

**The organization signup is production-ready and stores all data in MongoDB!** 🚀
