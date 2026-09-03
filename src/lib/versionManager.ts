/**
 * Version Management & Cache Buster (Zero Tolerance to Stale Bundles)
 * Ensures tablet and mobile clients never get stuck on obsolete Service Worker caches.
 */

export const APP_VERSION = '1.4.2';
export const APP_BUILD_ID = '2026.09.03-v1.4.2-sync-final';

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
