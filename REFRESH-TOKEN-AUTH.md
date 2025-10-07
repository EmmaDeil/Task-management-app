# Improved Authentication System with Refresh Tokens

## Overview

The application now uses a **secure authentication system** with:
- **Short-lived access tokens** (15 minutes)
- **Long-lived refresh tokens** (7 days) stored in httpOnly cookies
- **Automatic token refresh** on expiration
- **Enhanced security** against XSS and CSRF attacks

## Architecture

### Token Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      USER LOGIN                               │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend validates credentials and generates:                 │
│  • Access Token (JWT) - 15 min expiry                        │
│  • Refresh Token (JWT) - 7 day expiry                        │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  Response:                                                     │
│  • Access Token → Sent in response body (localStorage)       │
│  • Refresh Token → Set in httpOnly cookie (secure)           │
│  • User Data → Sent in response body                         │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    MAKING API REQUESTS                        │
│  Frontend sends: Authorization: Bearer <access_token>        │
│  Backend validates access token                              │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────┴────────┐
                    │                 │
            ✅ Valid Token      ❌ 401 Expired Token
                    │                 │
                    ▼                 ▼
         ┌──────────────┐   ┌──────────────────┐
         │ API Response │   │ Automatic Refresh│
         └──────────────┘   └──────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────────┐
                        │ Frontend sends refresh token │
                        │ (automatically from cookie)  │
                        └──────────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────────┐
                        │ Backend validates refresh    │
                        │ token and issues new access  │
                        │ token (15 min)               │
                        └──────────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────────┐
                        │ Frontend retries original    │
                        │ request with new token       │
                        └──────────────────────────────┘
```

## Implementation Details

### Backend Changes

#### 1. Environment Variables (`.env`)

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=15m  # Short-lived access token
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRE=7d  # Long-lived refresh token
FRONTEND_URL=http://localhost:5173  # For CORS
```

#### 2. User Model (`server/models/User.cjs`)

Added `refreshToken` field:

```javascript
refreshToken: {
  type: String,
  select: false,  // Not returned by default for security
}
```

#### 3. Server Configuration (`server/server.cjs`)

- **Installed `cookie-parser`**: `npm install cookie-parser`
- **Configured CORS** to allow credentials:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true, // Allow cookies
}));
app.use(cookieParser()); // Parse cookies
```

#### 4. Auth Routes (`server/routes/auth.cjs`)

**New Functions:**

```javascript
// Generate access token (15 min)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });
};

// Generate refresh token (7 days)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

// Set refresh token in httpOnly cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,      // Cannot be accessed by JavaScript (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax",     // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
```

**Updated Login Endpoint:**

```javascript
// Generate tokens
const token = generateToken(user._id);
const refreshToken = generateRefreshToken(user._id);

// Save refresh token to database
user.refreshToken = refreshToken;
await user.save();

// Set refresh token in httpOnly cookie
setRefreshTokenCookie(res, refreshToken);

// Return access token and user data
res.json({ token, user: {...} });
```

**New Refresh Token Endpoint:**

```javascript
POST /api/auth/refresh

// Reads refresh token from httpOnly cookie
// Validates refresh token matches database
// Issues new access token
// Returns new access token and user data
```

**New Logout Endpoint:**

```javascript
POST /api/auth/logout

// Clears refresh token from database
// Clears refresh token cookie
// Returns success message
```

### Frontend Changes

#### 1. API Service (`src/services/api.js`)

**Enabled Credentials:**

```javascript
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
});
```

**Smart 401 Interceptor:**

```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't tried refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token (refresh token sent automatically via cookie)
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, 
          { withCredentials: true }
        );

        const { token, user } = response.data;

        // Update localStorage with new token
        localStorage.setItem("auth", JSON.stringify({ token, user, organization: user.organization }));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.clear();
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);
```

**New Auth API Methods:**

```javascript
export const authAPI = {
  // ... existing methods

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },
};
```

#### 2. Auth Provider (`src/components/auth/AuthProvider.jsx`)

**Updated Logout:**

```javascript
const logout = async () => {
  try {
    // Call backend to clear refresh token
    await authAPI.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always clear frontend state
    localStorage.clear();
    dispatch({ type: "LOGOUT" });
  }
};
```

#### 3. Dashboard (`src/routes/Dashboard.jsx`)

**Simplified Error Handling:**

```javascript
catch (error) {
  // 401 errors are handled automatically by interceptor
  if (error.response?.status !== 401) {
    toast.showError(handleError(error, "Fetch Tasks"));
  }
  dispatch({ type: "tasks/setTasks", payload: [] });
}
```

## Security Benefits

### 1. XSS Protection
- **Refresh token stored in httpOnly cookie** - Cannot be accessed by JavaScript
- Even if XSS attack injects malicious script, it cannot steal refresh token
- Access token expires in 15 minutes, limiting damage window

### 2. CSRF Protection
- **SameSite cookie attribute** - Cookies only sent to same-origin requests
- **CORS configuration** - Only allows requests from trusted frontend URL

### 3. Token Rotation
- **Short access token lifetime** (15 min) - Reduces exposure window
- **Long refresh token lifetime** (7 days) - Better UX, fewer re-logins
- **Refresh token stored in DB** - Can be invalidated on logout

### 4. Graceful Token Refresh
- **Automatic refresh** - Users don't notice token expiration
- **Failed requests retried** - Seamless user experience
- **Fallback to login** - Only on complete auth failure

## Security Comparison

| Feature | Old System | New System |
|---------|-----------|-----------|
| **Access Token Expiry** | 60 days | 15 minutes |
| **Token Storage** | localStorage only | httpOnly cookie + localStorage |
| **XSS Vulnerable** | ✅ Yes - token in localStorage | ⚠️ Partial - only access token |
| **CSRF Protection** | ❌ None | ✅ SameSite cookies |
| **Auto Token Refresh** | ❌ No | ✅ Yes |
| **Manual Logout** | ❌ Client-side only | ✅ Clears server tokens |
| **Token Revocation** | ❌ Not possible | ✅ Can invalidate refresh tokens |

## Testing

### Manual Testing Checklist

- [ ] **Login Flow**
  - User can log in successfully
  - Access token stored in localStorage
  - Refresh token set in cookie (check DevTools → Application → Cookies)
  - User redirected to dashboard

- [ ] **Token Refresh**
  - Wait 15 minutes or manually expire access token
  - Make API request (e.g., load tasks)
  - Request fails with 401
  - Frontend automatically calls `/auth/refresh`
  - New access token received
  - Original request retried successfully
  - User stays logged in

- [ ] **Logout**
  - Click logout
  - Refresh token cleared from database
  - Refresh token cookie removed
  - User redirected to login

- [ ] **Session Persistence**
  - Log in
  - Close browser
  - Reopen browser
  - Navigate to app
  - User still logged in (refresh token valid)

- [ ] **Multiple Tabs**
  - Open app in two tabs
  - Log out in one tab
  - Other tab should redirect to login on next request

### Browser DevTools Checks

**Check Cookies:**
```
Application → Cookies → http://localhost:5173
Should see: refreshToken (httpOnly, 7 days)
```

**Check localStorage:**
```
Application → Local Storage → http://localhost:5173
Should see: auth = { token, user, organization }
```

**Check Network:**
```
Network → Filter: auth/refresh
Should see automatic refresh calls when access token expires
```

## Troubleshooting

### Issue: "No refresh token provided"

**Cause:** Cookie not being sent with request

**Solution:**
- Check `withCredentials: true` in axios config
- Check CORS allows credentials: `credentials: true`
- Check frontend and backend URLs match (no port mismatches)

### Issue: "Invalid refresh token"

**Cause:** Token mismatch between cookie and database

**Solution:**
- Clear cookies and localStorage
- Log in again
- Check `JWT_REFRESH_SECRET` in `.env`

### Issue: Infinite refresh loop

**Cause:** Refresh endpoint also requiring auth

**Solution:**
- Ensure `/auth/refresh` is **public** (no `protect` middleware)
- Check `_retry` flag is being set correctly

### Issue: CORS errors

**Cause:** Credentials not allowed or wrong origin

**Solution:**
- Check `FRONTEND_URL` in backend `.env`
- Ensure `cors({ origin: FRONTEND_URL, credentials: true })`
- Frontend must use exact URL (not localhost vs 127.0.0.1)

## Production Deployment

### Backend Environment Variables

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret-minimum-32-chars>
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=<different-strong-random-secret>
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=https://yourdomain.com
```

### Security Checklist

- [ ] Use HTTPS in production (for `secure` cookies)
- [ ] Set strong random secrets (32+ characters)
- [ ] Use different secrets for access and refresh tokens
- [ ] Set proper CORS origin (no wildcards in production)
- [ ] Enable rate limiting on `/auth/login` and `/auth/refresh`
- [ ] Implement refresh token rotation (optional - new refresh token on each refresh)
- [ ] Add IP-based anomaly detection (optional)
- [ ] Log all auth events (login, logout, refresh) for audit

## Future Enhancements

### 1. Refresh Token Rotation
- Issue new refresh token on each refresh
- Invalidate old refresh token
- Protects against stolen refresh tokens

### 2. Device Tracking
- Store device info with refresh token
- Allow users to view logged-in devices
- Allow users to revoke specific device sessions

### 3. Multi-Factor Authentication (2FA)
- Require 2FA code after password
- Store 2FA secret in user model
- Generate TOTP codes

### 4. Session Limits
- Limit concurrent sessions per user
- Store all active refresh tokens in array
- Enforce maximum session count

### 5. Geolocation Checks
- Track login IP addresses
- Alert on login from new location
- Require additional verification

## Conclusion

The new authentication system provides **enterprise-grade security** while maintaining a **seamless user experience**. Key improvements:

✅ **15-minute access tokens** reduce attack surface
✅ **httpOnly cookies** protect against XSS
✅ **Automatic token refresh** prevents interruptions
✅ **Server-side token revocation** enables proper logout
✅ **CSRF protection** via SameSite cookies
✅ **Better UX** with 7-day sessions

**Status:** ✅ IMPLEMENTED AND READY FOR TESTING
**Date:** October 2025
