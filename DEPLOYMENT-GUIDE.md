# TaskFlow - Deployment & Mobile/Desktop Guide

## 📋 Table of Contents
1. [Understanding .cjs Files](#understanding-cjs-files)
2. [Converting to Mobile App](#converting-to-mobile-app)
3. [Converting to Desktop App](#converting-to-desktop-app)
4. [Dashboard Buttons - Now Functional](#dashboard-buttons)

---

## 1. Understanding .cjs Files

### What does .cjs mean?

**`.cjs`** stands for **CommonJS** - a module system used in Node.js.

### Why are your server files using .cjs?

Your project structure:
- **Frontend (src/)**: Uses **ES Modules** (`import/export` syntax) - Modern JavaScript
- **Backend (server/)**: Uses **CommonJS** (`require/module.exports` syntax) - Traditional Node.js

### The Problem We Solved:

Your `package.json` has `"type": "module"`, which tells Node.js to treat all `.js` files as ES Modules. However, your backend server was written using CommonJS syntax (`require`, `module.exports`).

**Solution:** We renamed server files to `.cjs` to explicitly tell Node.js:
> "Hey, these files use the old CommonJS syntax, not ES Modules!"

### Files with .cjs extension:
```
server/
├── server.cjs              # Main server file
├── config/
│   └── db.cjs             # Database configuration
├── models/
│   ├── User.cjs           # User model
│   ├── Task.cjs           # Task model
│   └── Organization.cjs   # Organization model
├── routes/
│   ├── auth.cjs           # Authentication routes
│   ├── tasks.cjs          # Task routes
│   ├── users.cjs          # User routes
│   └── organizations.cjs  # Organization routes
└── middleware/
    └── auth.cjs           # Authentication middleware
```

### Should you change them back to .js?

**Two options:**

**Option A: Keep .cjs** (Current - Easiest)
- ✅ Works perfectly as-is
- ✅ Clear separation between frontend/backend module systems
- ❌ Slightly unconventional

**Option B: Convert to ES Modules** (More work)
- Need to change all `require()` to `import`
- Change all `module.exports` to `export`
- Update all files to `.js`
- More modern but requires refactoring

**Recommendation:** Keep `.cjs` - it works great and is explicit about module type!

---

## 2. Converting to Mobile App (iOS & Android)

### Option 1: React Native (Requires Complete Rewrite) ❌
- Would need to rewrite entire app
- Different components (View, Text instead of div, span)
- Not recommended for existing web apps

### Option 2: Expo (Easier but Still Significant Work) ⚠️
- Can share some logic but UI needs rewrite
- Uses React Native under the hood

### Option 3: **Capacitor** (Recommended) ✅

**Capacitor** by Ionic wraps your React web app into a native mobile app with minimal changes!

#### Step-by-Step Guide:

1. **Install Capacitor:**
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

2. **Initialize Capacitor:**
```bash
npx cap init
# Follow prompts:
# App name: TaskFlow
# App ID: com.taskflow.app (use your domain in reverse)
# Web Dir: dist (Vite's build output)
```

3. **Build your web app:**
```bash
npm run build
```

4. **Add mobile platforms:**
```bash
# For Android
npx cap add android

# For iOS (macOS only)
npx cap add ios
```

5. **Sync your web app to mobile:**
```bash
npx cap sync
```

6. **Open in native IDE:**
```bash
# Android Studio
npx cap open android

# Xcode (macOS only)
npx cap open ios
```

7. **Run on device/emulator:**
- Android: Click "Run" in Android Studio
- iOS: Click "Run" in Xcode

#### Mobile-Specific Adjustments:

Add to `capacitor.config.json`:
```json
{
  "appId": "com.taskflow.app",
  "appName": "TaskFlow",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  }
}
```

Update API calls to handle mobile:
```javascript
// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://your-backend-url.com/api');
```

---

## 3. Converting to Desktop App (Windows, macOS, Linux)

### Option: **Electron** (Recommended) ✅

**Electron** wraps your React web app into a native desktop application!

#### Step-by-Step Guide:

1. **Install Electron:**
```bash
npm install --save-dev electron electron-builder
```

2. **Create Electron main file:**

Create `electron/main.cjs`:
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // In development
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5174');
  } else {
    // In production
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

3. **Update package.json:**
```json
{
  "main": "electron/main.cjs",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5174 && electron .\"",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.taskflow.app",
    "productName": "TaskFlow",
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "directories": {
      "buildResources": "assets"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png"
    }
  }
}
```

4. **Install additional dependencies:**
```bash
npm install --save-dev concurrently wait-on
```

5. **Run in development:**
```bash
npm run electron:dev
```

6. **Build for production:**
```bash
npm run electron:build
```

This creates installers in the `dist` folder:
- Windows: `.exe` installer
- macOS: `.dmg` file
- Linux: `.AppImage` file

---

## 4. Dashboard Buttons - Now Functional! ✅

### Changes Made:

All buttons in the Dashboard are now functional:

#### 1. "View All Tasks" Button
- **Action:** Navigates to the Tasks page (`/tasks`)
- **Shows:** Full TaskBoard with all tasks

#### 2. "Create New Task" Button
- **Action:** Opens the Task Form modal
- **Allows:** Creating a new task with all details
- **Integration:** Task appears immediately in TaskBoard after creation

#### 3. "Start New Project" Button
- **Action:** Opens the Project Form modal
- **Allows:** Creating a new project with details
- **Integration:** Project appears in Projects page after creation

### How It Works:

```javascript
// Dashboard receives props from App.jsx
<Dashboard 
  onNewTask={() => openTaskFormModal()} 
  onNewProject={() => openProjectFormModal()} 
/>

// Buttons trigger the modal functions
<button onClick={onNewTask}>Create New Task</button>
<button onClick={onNewProject}>Start New Project</button>
```

### Test It:

1. Go to Dashboard (`http://localhost:5174/dashboard`)
2. Click **"Create New Task"** → Task form modal appears
3. Fill in details → Submit → Task appears in TaskBoard
4. Click **"Start New Project"** → Project form modal appears
5. Fill in details → Submit → Project appears in Projects page
6. Click **"View All Tasks"** → Navigate to full TaskBoard view

---

## Summary

| Question | Answer | Recommendation |
|----------|--------|----------------|
| **What is .cjs?** | CommonJS module files for Node.js server | ✅ Keep as-is |
| **Mobile App?** | Use Capacitor to wrap React app | ✅ Recommended |
| **Desktop App?** | Use Electron to wrap React app | ✅ Recommended |
| **Dashboard Buttons?** | Now fully functional! | ✅ Completed |

---

## Next Steps

1. **Test Dashboard buttons** - All working now!
2. **Choose deployment target:**
   - Mobile → Follow Capacitor guide
   - Desktop → Follow Electron guide
   - Both → Do both! They don't conflict
3. **Deploy web version** - Can also deploy as regular web app

Need help with any specific deployment? Let me know!
