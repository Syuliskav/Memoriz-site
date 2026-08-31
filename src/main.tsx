import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {registerSW} from 'virtual:pwa-register';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Progressive Web App Service Worker immediately for 100% offline support
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New content available; will auto-update.');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[PWA] App is ready to work completely offline.');
  },
  onRegisteredSW(swScriptUrl, registration) {
    console.log('[PWA] Service worker registered successfully:', swScriptUrl, registration);
  },
  onRegisterError(error) {
    console.warn('[PWA] Service worker registration error:', error);
  },
});
