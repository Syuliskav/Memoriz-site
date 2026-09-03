import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  hasUpdate: boolean;
  isChecking: boolean;
  lastCheckedTime: Date | null;
  checkForUpdates: () => Promise<boolean>;
  applyUpdate: () => void;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      console.log('[Network] Dispositivo online reconectado.');
      setIsOnline(true);
      // When connection is restored, trigger a single gentle check
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) reg.update().catch(() => {});
        });
      }
    };

    const handleOffline = () => {
      console.log('[Network] Dispositivo offline. Modo estudo local ativo.');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker waiting status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;

        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setHasUpdate(true);
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setHasUpdate(true);
              console.log('[PWA] Nova versão disponível para ativação.');
            }
          });
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    if (!navigator.onLine) {
      return false;
    }

    setIsChecking(true);
    setLastCheckedTime(new Date());

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setHasUpdate(true);
          return true;
        }
      }
    } catch (err) {
      console.warn('[PWA] Verificação de atualização:', err);
    } finally {
      setIsChecking(false);
    }

    return false;
  }, []);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload safely
    setTimeout(() => {
      window.location.reload();
    }, 150);
  }, [waitingWorker]);

  return {
    isOnline,
    hasUpdate,
    isChecking,
    lastCheckedTime,
    checkForUpdates,
    applyUpdate,
  };
}
