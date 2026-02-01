// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import './i18n';

// ✅ Disable ALL console logs (both dev & production)
// Change to `import.meta.env.PROD` if you want logs only in development
const DISABLE_LOGS = false; // Set to false to enable logs

if (DISABLE_LOGS) {
  console.log = () => { };
  console.debug = () => { };
  console.info = () => { };
  console.warn = () => { };
  console.group = () => { };
  console.groupEnd = () => { };
  // Keep console.error for critical issues
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);