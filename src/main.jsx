import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './telemetry.js'
import { runMigrations } from './utils/migrations.js'

runMigrations();

// Registering a service worker in the Vite dev server causes it to cache
// and serve stale dev bundles across restarts, breaking HMR — only run in
// production builds.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
