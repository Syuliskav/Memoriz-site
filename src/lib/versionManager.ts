/**
 * Version Management & Cache Buster (Zero Tolerance to Stale Bundles)
 * Ensures tablet and mobile clients never get stuck on obsolete Service Worker caches.
 */

// Injected dynamically at build-time via vite.config.ts define
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.4.3';
export const APP_BUILD_ID = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : new Date().toISOString();

const BUILD_STORAGE_KEY = 'memoriz_app_build_sig';

export async function enforceLatestVersion(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const currentStored = localStorage.getItem(BUILD_STORAGE_KEY);

    if (currentStored !== APP_BUILD_ID) {
      console.log(`[VersionManager] Version mismatch detected (old: ${currentStored} -> new: ${APP_BUILD_ID}). Purging legacy caches...`);

      // 1. Purge all Workbox and browser CacheStorage entries
      if ('caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(
          cacheKeys.map(async (key) => {
            console.log(`[VersionManager] Deleting cache: ${key}`);
            await window.caches.delete(key);
          })
        );
      }

      // 2. Save new signature to avoid looping
      localStorage.setItem(BUILD_STORAGE_KEY, APP_BUILD_ID);

      // 3. Check for any active service worker registrations and force an update
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          try {
            await reg.update();
          } catch (e) {
            console.warn('[VersionManager] Service worker update check failed:', e);
          }
        }
      }

      return true;
    }
  } catch (err) {
    console.warn('[VersionManager] Error enforcing version:', err);
  }

  return false;
}

/**
 * Manual hard-reload and cache purge if user explicitly wants to refresh
 */
export async function forcePurgeAndReload(): Promise<void> {
  try {
    if ('caches' in window) {
      const keys = await window.caches.keys();
      for (const k of keys) {
        await window.caches.delete(k);
      }
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    }
    localStorage.setItem(BUILD_STORAGE_KEY, APP_BUILD_ID);
  } finally {
    window.location.reload();
  }
}

/**
 * Lightweight update check using native Service Worker API and Navigator Network info.
 * Zero-battery drain: only called on demand or on network reconnect.
 */
export async function checkAppUpdate(): Promise<{ hasUpdate: boolean; message: string }> {
  if (typeof window === 'undefined') {
    return { hasUpdate: false, message: 'Ambiente não suportado' };
  }

  if (!navigator.onLine) {
    return { 
      hasUpdate: false, 
      message: 'Você está offline. O Memoriz está rodando perfeitamente a partir do cache local do seu dispositivo.' 
    };
  }

  if (!('serviceWorker' in navigator)) {
    return { 
      hasUpdate: false, 
      message: 'O navegador atual não oferece suporte a Service Workers.' 
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return { 
        hasUpdate: false, 
        message: 'Você está utilizando a versão mais recente do aplicativo.' 
      };
    }

    // Trigger update check via Service Worker
    await registration.update();

    if (registration.waiting || registration.installing) {
      return { 
        hasUpdate: true, 
        message: 'Uma nova versão foi encontrada e está pronta para ser ativada!' 
      };
    }

    return { 
      hasUpdate: false, 
      message: 'Você já está utilizando a versão mais recente com cache atualizado.' 
    };
  } catch (err) {
    return { 
      hasUpdate: false, 
      message: 'Não foi possível verificar no momento. O aplicativo continua funcionando normalmente.' 
    };
  }
}
