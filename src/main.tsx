
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupElectronBridge } from './utils/electronBridge.ts'
import { ThemeProvider } from './contexts/ThemeContext.tsx'

// Setup electron bridge for desktop app functionality
setupElectronBridge();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
