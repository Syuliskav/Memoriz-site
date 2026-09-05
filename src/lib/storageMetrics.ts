/**
 * Intelligent Storage Metrics & Browser Quota Inspector
 * Analyzes browser storage limits, IndexedDB/LocalStorage usage,
 * and persistence status across Chromium, Firefox, Safari/WebKit.
 */

export interface StorageMetricsInfo {
  usageBytes: number;
  quotaBytes: number;
  usageFormatted: string;
  quotaFormatted: string;
  percentUsed: number;
  isPersisted: boolean;
  canPersist: boolean;
  browserType: 'Chromium' | 'Firefox' | 'Safari' | 'Other';
  description: string;
}

export async function checkStorageMetrics(): Promise<StorageMetricsInfo> {
  let usageBytes = 0;
  let quotaBytes = 0;
  let isPersisted = false;
  const canPersist = typeof navigator !== 'undefined' && 'storage' in navigator && typeof navigator.storage.persist === 'function';

  // Detect browser engine for custom storage guidance
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let browserType: 'Chromium' | 'Firefox' | 'Safari' | 'Other' = 'Other';
  if (/Firefox/i.test(ua)) {
    browserType = 'Firefox';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browserType = 'Safari';
  } else if (/Chrome|Edg|OPR|Brave/i.test(ua)) {
    browserType = 'Chromium';
  }

  if (typeof navigator !== 'undefined' && 'storage' in navigator && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      usageBytes = estimate.usage || 0;
      quotaBytes = estimate.quota || 0;

      if (navigator.storage.persisted) {
        isPersisted = await navigator.storage.persisted();
      }
    } catch (e) {
      console.warn('Storage estimate unavailable', e);
    }
  }

  // If estimate unavailable, calculate rough localStorage usage
  if (usageBytes === 0 && typeof localStorage !== 'undefined') {
    try {
      let totalLength = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalLength += (localStorage[key]?.length || 0) + key.length;
        }
      }
      usageBytes = totalLength * 2; // UTF-16 characters = 2 bytes approx
      quotaBytes = quotaBytes || 5 * 1024 * 1024; // Standard 5MB LocalStorage default fallback
    } catch {
      // ignore
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const percentUsed = quotaBytes > 0 ? Math.min(100, (usageBytes / quotaBytes) * 100) : 0;

  let description = '';
  switch (browserType) {
    case 'Chromium':
      description = 'Navegadores baseados no Chromium (Chrome, Edge, Brave, Opera) alocam até 60% do espaço livre do disco para o site. Com armazenamento persistente ativado, os dados nunca são expurgados pelo navegador.';
      break;
    case 'Firefox':
      description = 'O Firefox aloca até 50% do disco livre (com cota inicial de até 2GB por domínio). O modo persistente impede que o Firefox limpe os dados sob pressão de memória.';
      break;
    case 'Safari':
      description = 'O WebKit/Safari limita a 1GB antes de exigir confirmação, e políticas ITP podem expurgar dados de abas inativas após 7 dias se o app não estiver instalado como PWA ou com persistência ativa.';
      break;
    default:
      description = 'Armazenamento web gerenciado com suporte a IndexedDB e LocalStorage.';
  }

  return {
    usageBytes,
    quotaBytes,
    usageFormatted: formatBytes(usageBytes),
    quotaFormatted: formatBytes(quotaBytes),
    percentUsed: Number(percentUsed.toFixed(2)),
    isPersisted,
    canPersist,
    browserType,
    description,
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'storage' in navigator && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch (e) {
      console.warn('Error requesting storage persistence', e);
    }
  }
  return false;
}
