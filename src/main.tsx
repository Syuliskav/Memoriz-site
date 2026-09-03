import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {registerSW} from 'virtual:pwa-register';
import {enforceLatestVersion} from './lib/versionManager';

// Run version enforcement to wipe stale cache if a new deployment is detected
enforceLatestVersion().catch((err) => {
  console.warn('[PWA] Version check caught error:', err);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Zero Tolerance to Stale Service Worker:
// When a new service worker activates and claims the clients, auto-reload cleanly
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[PWA] Controller changed -> reloading to activate fresh build');
      window.location.reload();
    }
  });
}

// Register Progressive Web App Service Worker with aggressive update checks
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New version detected! Triggering instant update...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[PWA] App is ready to work completely offline.');
  },
  onRegisteredSW(swScriptUrl, registration) {
    if (registration) {
      // Check for updates when tab regains focus or visibility
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          registration.update().catch(() => {});
        }
      });
      // Periodic check every 15 minutes when online
      setInterval(() => {
        if (navigator.onLine) {
          registration.update().catch(() => {});
        }
      }, 15 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.warn('[PWA] Service worker registration error:', error);
  },
});

