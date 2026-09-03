import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
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

// Safe Service Worker registration with battery-friendly event hooks
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // Direct Service Worker registration
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker ativo com suporte offline no escopo:', registration.scope);

        // Dispara verificação de atualização leve quando o dispositivo voltar a ficar online
        window.addEventListener('online', () => {
          console.log('[PWA] Rede restabelecida -> verificando atualizações disponíveis...');
          registration.update().catch(() => {});
        });

        // Verificação leve ao focar a aba/app (somente se online)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && navigator.onLine) {
            registration.update().catch(() => {});
          }
        });
      })
      .catch((err) => {
        console.warn('[PWA] Aviso no registro do Service Worker:', err);
      });
  });
}


