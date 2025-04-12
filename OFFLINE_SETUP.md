
# Setting Up Demo Retail Management System for Offline Use

This guide will walk you through the process of setting up the Demo Retail Management System for offline use and packaging it as a desktop application using Electron.

## Part 1: Running the Project in Offline Mode

This application is already designed to work offline using the browser's localStorage for data storage. Here's how to set it up:

1. **Clone or download the project**
   ```bash
   git clone [your-repository-url]
   cd retail-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application in development mode**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Serve the production build locally** (for testing)
   ```bash
   npm run preview
   ```

## Part 2: Creating an Electron Desktop Application

To distribute the application as a desktop application, follow these steps:

### Step 1: Install Electron and Required Dependencies

```bash
npm install --save-dev electron electron-builder concurrently wait-on cross-env electron-is-dev
```

### Step 2: Create Electron Main Process File

Create a file named `electron.js` in the root directory:

```javascript
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'public/favicon.ico')
  });

  // Load the app
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173' // Dev server address
      : `file://${path.join(__dirname, 'dist/index.html')}` // Production build
  );

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Data',
          click() {
            mainWindow.webContents.executeJavaScript('window.exportData && window.exportData()');
          }
        },
        {
          label: 'Import Data',
          click() {
            mainWindow.webContents.executeJavaScript('window.importData && window.importData()');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click() {
            mainWindow.webContents.executeJavaScript(
              'alert("D MART Retail Management System\\nVersion 1.0.0\\n© 2025 Demo")'
            );
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

### Step 3: Update package.json

Add the following to your package.json:

```json
{
  "main": "electron.js",
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:package": "electron-builder --dir"
  },
  "build": {
    "appId": "com.dmart.retailmanagement",
    "productName": "D MART Retail Management",
    "directories": {
      "output": "electron-dist"
    },
    "files": [
      "dist/**/*",
      "electron.js",
      "package.json"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/favicon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "public/favicon.ico"
    },
    "linux": {
      "target": "AppImage",
      "icon": "public/favicon.ico"
    }
  }
}
```

### Step 4: Create Global Export/Import Functions

Add this script to your index.html or create a new file to include in your build:

```javascript
// In src/utils/electronBridge.ts
export const setupElectronBridge = () => {
  if (window) {
    // Export function that Electron menu can call
    (window as any).exportData = () => {
      const backupUrl = backupData();
      const element = document.createElement("a");
      element.href = backupUrl;
      element.download = `dmart-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };

    // Import function that Electron menu can call
    (window as any).importData = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
          const success = restoreData(data);
          
          if (success) {
            alert("Data restored successfully. The application will now reload.");
            window.location.reload();
          } else {
            alert("Failed to restore data. The file might be corrupted.");
          }
        };
        reader.readAsText(file);
      };
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    };
  }
};
```

Update your main.tsx to use this:

```javascript
// In src/main.tsx
import { setupElectronBridge } from './utils/electronBridge';

// ... rest of your imports

// Setup electron bridge for desktop app functionality
setupElectronBridge();

// ... rest of your main.tsx
```

### Step 5: Building the Electron App

1. First, build your React app:
   ```bash
   npm run build
   ```

2. Then, package it as an Electron app:
   ```bash
   npm run electron:build
   ```

   This will create installable files in the `electron-dist` directory.

### Step 6: Distributing to Clients

1. For Windows users: Share the .exe installer from electron-dist
2. For Mac users: Share the .dmg file from electron-dist
3. For Linux users: Share the AppImage from electron-dist

## Important Notes for Offline Use

1. **Data Storage**: All data is stored in the user's browser localStorage (even in Electron)
2. **Backup Regularly**: Remind users to use the Export Data feature regularly
3. **Storage Limitations**: localStorage has a 5-10MB limit, which should be sufficient for most small businesses but may need monitoring

## Troubleshooting

1. **Application doesn't start**: Check if all dependencies are installed
2. **No data appears**: Verify that localStorage is enabled in the browser/Electron
3. **Print issues**: Verify printer connections and browser print settings

## Technical Support

For technical support, please contact:
- Email: support@dmart.example.com
- Phone: +91 98765 43210
