// Specialized Diagnostic Probe for measuring carousel slide widths, document width, window width,
// and content cut / veil overlap across all carousel pages.

export interface DiagnosticSlideMeasurement {
  slideIndex: number;
  slideName: string;
  slideOffsetWidth: number;
  slideBoundingWidth: number;
  contentOffsetWidth: number;
  contentBoundingWidth: number;
  contentRight: number;
  veilRightLeft: number;
  veilOverlapPx: number;
  hasCut: boolean;
}

export interface CarouselDiagnosticReport {
  timestamp: string;
  windowInnerWidth: number;
  documentElementClientWidth: number;
  appCalculatedContainerWidth: number;
  carouselContainerBoundingWidth: number;
  carouselContainerClientWidth: number;
  bodyOverflow: string;
  htmlOverflowY: string;
  devicePixelRatio: number;
  slides: DiagnosticSlideMeasurement[];
  overflowTest?: {
    beforeModal: {
      clientWidth: number;
      containerBoundingWidth: number;
      appWidth: number;
    };
    duringModal: {
      clientWidth: number;
      containerBoundingWidth: number;
      appWidth: number;
    };
    afterModal: {
      clientWidth: number;
      containerBoundingWidth: number;
      appWidth: number;
    };
    bodyOverflowChangedWidth: boolean;
  };
}

const SLIDE_NAMES = ['Prática', 'Fixação (SRS)', 'Caderno de Erros', 'Simulado', 'Métricas'];

export function runCarouselDiagnostic(
  containerWidth: number,
  containerEl: HTMLElement | null,
  slideEls: (HTMLElement | null)[],
  veilRightEl: HTMLElement | null
): CarouselDiagnosticReport | null {
  if (typeof window === 'undefined' || !containerEl) return null;

  const docEl = document.documentElement;
  const containerRect = containerEl.getBoundingClientRect();
  const veilRect = veilRightEl ? veilRightEl.getBoundingClientRect() : { left: 0, right: 0, width: 0 };

  const slides: DiagnosticSlideMeasurement[] = slideEls.map((slideEl, idx) => {
    if (!slideEl) {
      return {
        slideIndex: idx,
        slideName: SLIDE_NAMES[idx] || `Slide ${idx}`,
        slideOffsetWidth: 0,
        slideBoundingWidth: 0,
        contentOffsetWidth: 0,
        contentBoundingWidth: 0,
        contentRight: 0,
        veilRightLeft: veilRect.left,
        veilOverlapPx: 0,
        hasCut: false,
      };
    }

    const slideRect = slideEl.getBoundingClientRect();
    const contentChild = (slideEl.firstElementChild as HTMLElement) || slideEl;
    const contentRect = contentChild.getBoundingClientRect();

    // The content right edge compared to the veil's left edge
    // If the content edge extends further to the right than the veil's left edge, the veil is covering it
    const veilOverlapPx = Number((contentRect.right - veilRect.left).toFixed(2));
    const hasCut = veilOverlapPx > 0.05;

    return {
      slideIndex: idx,
      slideName: SLIDE_NAMES[idx] || `Slide ${idx}`,
      slideOffsetWidth: slideEl.offsetWidth,
      slideBoundingWidth: Number(slideRect.width.toFixed(2)),
      contentOffsetWidth: contentChild.offsetWidth,
      contentBoundingWidth: Number(contentRect.width.toFixed(2)),
      contentRight: Number(contentRect.right.toFixed(2)),
      veilRightLeft: Number(veilRect.left.toFixed(2)),
      veilOverlapPx,
      hasCut,
    };
  });

  // Modal / body overflow correlation test
  const initialOverflow = document.body.style.overflow;
  const beforeClientWidth = docEl.clientWidth;
  const beforeContainerWidth = Number(containerEl.getBoundingClientRect().width.toFixed(2));

  // Simulate body overflow: hidden
  document.body.style.overflow = 'hidden';
  const duringClientWidth = docEl.clientWidth;
  const duringContainerWidth = Number(containerEl.getBoundingClientRect().width.toFixed(2));

  // Restore
  document.body.style.overflow = initialOverflow;
  const afterClientWidth = docEl.clientWidth;
  const afterContainerWidth = Number(containerEl.getBoundingClientRect().width.toFixed(2));

  const report: CarouselDiagnosticReport = {
    timestamp: new Date().toISOString(),
    windowInnerWidth: window.innerWidth,
    documentElementClientWidth: docEl.clientWidth,
    appCalculatedContainerWidth: containerWidth,
    carouselContainerBoundingWidth: Number(containerRect.width.toFixed(2)),
    carouselContainerClientWidth: containerEl.clientWidth,
    bodyOverflow: initialOverflow || 'normal',
    htmlOverflowY: window.getComputedStyle(docEl).overflowY,
    devicePixelRatio: window.devicePixelRatio || 1,
    slides,
    overflowTest: {
      beforeModal: {
        clientWidth: beforeClientWidth,
        containerBoundingWidth: beforeContainerWidth,
        appWidth: containerWidth,
      },
      duringModal: {
        clientWidth: duringClientWidth,
        containerBoundingWidth: duringContainerWidth,
        appWidth: containerWidth,
      },
      afterModal: {
        clientWidth: afterClientWidth,
        containerBoundingWidth: afterContainerWidth,
        appWidth: containerWidth,
      },
      bodyOverflowChangedWidth: beforeClientWidth !== duringClientWidth || beforeContainerWidth !== duringContainerWidth,
    },
  };

  // Expose on window for manual inspection
  (window as any).__CAROUSEL_DIAGNOSTICS_DATA__ = report;

  // Send to Vite diagnostic backend endpoint
  try {
    fetch('/api/diagnostic-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report, null, 2),
    }).catch(() => {});
  } catch (_) {}

  return report;
}
