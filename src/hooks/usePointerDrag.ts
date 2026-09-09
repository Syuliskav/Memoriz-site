import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';

export interface PillGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface TrackSnapDragProgressInfo {
  progress: number;
  closestIndex: number;
  fromIndex: number;
  toIndex: number;
  segmentProgress: number;
  clampedLeft: number;
  clampedCenter: number;
}

export interface UseTrackSnapDragOptions {
  itemCount: number;
  activeIndex: number;
  containerRef?: React.RefObject<HTMLElement | null>;
  getItemElement: (index: number) => HTMLElement | null;
  dragThreshold?: number;
  externalProgress?: { activeIndex: number; offsetFraction: number; isDragging: boolean } | null;
  onDragMove?: (info: TrackSnapDragProgressInfo) => void;
  onSnap?: (finalIndex: number) => void;
  onDragEnd?: (hasDragged: boolean, closestIndex: number) => void;
  useContinuousInterpolation?: boolean;
}

export interface UseTrackSnapDragReturn {
  isDragging: boolean;
  dragProgress: number | null;
  closestIndex: number;
  pillGeometry: PillGeometry | null;
  syncGeometry: (index?: number) => void;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  handlePointerCancel: (e: React.PointerEvent) => void;
}

/**
 * Hook para trilhos com elementos segmentados e indicador deslizante com snap (snapping pointer drag).
 * Usado por DraggableModeSwitcher, DraggableThemeSwitcher e SliderSelector.
 */
export function useTrackSnapDrag({
  itemCount,
  activeIndex,
  containerRef,
  getItemElement,
  dragThreshold = 4,
  externalProgress,
  onDragMove,
  onSnap,
  onDragEnd,
  useContinuousInterpolation = true,
}: UseTrackSnapDragOptions): UseTrackSnapDragReturn {
  const [pillGeometry, setPillGeometry] = useState<PillGeometry | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [closestIndex, setClosestIndex] = useState<number>(activeIndex);

  const isDraggingRef = useRef(false);
  const isPointerDownRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const startLeftRef = useRef(0);
  const startIndexRef = useRef(activeIndex);
  const startCenterRef = useRef(0);
  const closestIndexRef = useRef(activeIndex);

  const getItemElementRef = useRef(getItemElement);
  getItemElementRef.current = getItemElement;
  const onDragMoveRef = useRef(onDragMove);
  onDragMoveRef.current = onDragMove;
  const onSnapRef = useRef(onSnap);
  onSnapRef.current = onSnap;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  // Sincroniza a geometria física do pill com base no elemento DOM do botão ativo
  const syncGeometry = useCallback((idx: number = activeIndex) => {
    const el = getItemElementRef.current(idx);
    if (!el) return;
    setPillGeometry({
      left: Math.round(el.offsetLeft),
      top: Math.round(el.offsetTop),
      width: Math.round(el.offsetWidth),
      height: Math.round(el.offsetHeight),
    });
  }, [activeIndex]);

  // Sincronização externa (ex: carrossel em transição ou arrasto de páginas)
  useLayoutEffect(() => {
    if (isDraggingRef.current) return;

    if (externalProgress && externalProgress.isDragging && itemCount > 0) {
      const p = Math.max(0, Math.min(itemCount - 1, externalProgress.activeIndex + externalProgress.offsetFraction));
      const fromIdx = Math.floor(p);
      const toIdx = Math.min(itemCount - 1, fromIdx + 1);
      const t = p - fromIdx;

      const bFrom = getItemElementRef.current(fromIdx);
      const bTo = getItemElementRef.current(toIdx);

      if (bFrom && bTo) {
        const fromLeft = bFrom.offsetLeft;
        const fromRight = bFrom.offsetLeft + bFrom.offsetWidth;
        const toLeft = bTo.offsetLeft;
        const toRight = bTo.offsetLeft + bTo.offsetWidth;

        const interpLeft = fromLeft * (1 - t) + toLeft * t;
        const interpRight = fromRight * (1 - t) + toRight * t;
        const interpWidth = interpRight - interpLeft;
        const interpTop = bFrom.offsetTop * (1 - t) + bTo.offsetTop * t;
        const interpHeight = bFrom.offsetHeight * (1 - t) + bTo.offsetHeight * t;

        setPillGeometry({
          left: Math.round(interpLeft),
          top: Math.round(interpTop),
          width: Math.round(interpWidth),
          height: Math.round(interpHeight),
        });
      }
    } else {
      syncGeometry(activeIndex);
    }
  }, [externalProgress, activeIndex, itemCount, syncGeometry]);

  // ResizeObserver para manter ancoragem perfeita durante redimensionamento
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (!isDraggingRef.current && (!externalProgress || !externalProgress.isDragging)) {
        syncGeometry(activeIndex);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, activeIndex, syncGeometry, externalProgress]);

  // Window resize fallback
  useEffect(() => {
    const handleResize = () => {
      if (!isDraggingRef.current && (!externalProgress || !externalProgress.isDragging)) {
        syncGeometry(activeIndex);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, syncGeometry, externalProgress]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || itemCount === 0) return;
    const currentBtn = getItemElementRef.current(activeIndex);
    if (!currentBtn) return;

    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    startLeftRef.current = currentBtn.offsetLeft;
    startIndexRef.current = activeIndex;
    startCenterRef.current = currentBtn.offsetLeft + currentBtn.offsetWidth / 2;
    closestIndexRef.current = activeIndex;
    setClosestIndex(activeIndex);
  };

  const processDragMove = useCallback((clientX: number) => {
    if (!isPointerDownRef.current) return;
    const delta = clientX - startXRef.current;

    if (!hasDraggedRef.current && Math.abs(delta) > dragThreshold) {
      hasDraggedRef.current = true;
      isDraggingRef.current = true;
      setIsDragging(true);
    }

    if (hasDraggedRef.current && itemCount > 0) {
      const firstBtn = getItemElementRef.current(0);
      const lastBtn = getItemElementRef.current(itemCount - 1);
      const currentBtn = getItemElementRef.current(startIndexRef.current) || firstBtn;
      if (!firstBtn || !lastBtn || !currentBtn) return;

      const centers: number[] = [];
      for (let i = 0; i < itemCount; i++) {
        const b = getItemElementRef.current(i);
        centers.push(b ? b.offsetLeft + b.offsetWidth / 2 : 0);
      }

      const startCenter = startCenterRef.current || (currentBtn.offsetLeft + currentBtn.offsetWidth / 2);
      const targetCenter = startCenter + delta;
      const minCenter = centers[0];
      const maxCenter = centers[itemCount - 1];
      const clampedCenter = Math.max(minCenter, Math.min(maxCenter, targetCenter));

      let p = 0;
      if (clampedCenter <= minCenter) {
        p = 0;
      } else if (clampedCenter >= maxCenter) {
        p = itemCount - 1;
      } else {
        for (let i = 0; i < itemCount - 1; i++) {
          if (clampedCenter >= centers[i] && clampedCenter <= centers[i + 1]) {
            const segDist = centers[i + 1] - centers[i];
            const t = segDist > 0 ? (clampedCenter - centers[i]) / segDist : 0;
            p = i + t;
            break;
          }
        }
      }

      const fromIdx = Math.floor(p);
      const toIdx = Math.min(itemCount - 1, fromIdx + 1);
      const segmentProgress = p - fromIdx;

      const bFrom = getItemElementRef.current(fromIdx) || currentBtn;
      const bTo = getItemElementRef.current(toIdx) || currentBtn;

      const minLeft = firstBtn.offsetLeft;
      const maxLeft = lastBtn.offsetLeft;
      const rawLeft = startLeftRef.current + delta;
      const clampedLeft = Math.max(minLeft, Math.min(maxLeft, rawLeft));

      let calculatedClosest = 0;
      if (useContinuousInterpolation) {
        calculatedClosest = Math.max(0, Math.min(itemCount - 1, Math.round(p)));
      } else {
        // Encontra o botão com centro mais próximo do centro atual do pill
        let minDistance = Infinity;
        const currentPillCenter = clampedLeft + currentBtn.offsetWidth / 2;
        for (let i = 0; i < itemCount; i++) {
          const btn = getItemElementRef.current(i);
          if (btn) {
            const btnCenter = btn.offsetLeft + btn.offsetWidth / 2;
            const dist = Math.abs(currentPillCenter - btnCenter);
            if (dist < minDistance) {
              minDistance = dist;
              calculatedClosest = i;
            }
          }
        }
      }

      closestIndexRef.current = calculatedClosest;
      setClosestIndex(calculatedClosest);
      setDragProgress(p);

      if (useContinuousInterpolation) {
        const fromLeft = bFrom.offsetLeft;
        const fromRight = bFrom.offsetLeft + bFrom.offsetWidth;
        const toLeft = bTo.offsetLeft;
        const toRight = bTo.offsetLeft + bTo.offsetWidth;

        const interpLeft = fromLeft * (1 - segmentProgress) + toLeft * segmentProgress;
        const interpRight = fromRight * (1 - segmentProgress) + toRight * segmentProgress;
        const interpWidth = interpRight - interpLeft;
        const interpTop = bFrom.offsetTop * (1 - segmentProgress) + bTo.offsetTop * segmentProgress;
        const interpHeight = bFrom.offsetHeight * (1 - segmentProgress) + bTo.offsetHeight * segmentProgress;

        setPillGeometry({
          left: Math.round(interpLeft),
          top: Math.round(interpTop),
          width: Math.round(interpWidth),
          height: Math.round(interpHeight),
        });
      } else {
        const targetBtn = getItemElementRef.current(calculatedClosest) || firstBtn;
        setPillGeometry({
          left: Math.round(clampedLeft),
          top: Math.round(targetBtn.offsetTop),
          width: Math.round(targetBtn.offsetWidth),
          height: Math.round(targetBtn.offsetHeight),
        });
      }

      if (onDragMoveRef.current) {
        onDragMoveRef.current({
          progress: p,
          closestIndex: calculatedClosest,
          fromIndex: fromIdx,
          toIndex: toIdx,
          segmentProgress,
          clampedLeft,
          clampedCenter,
        });
      }
    }
  }, [dragThreshold, itemCount, useContinuousInterpolation]);

  const endDragGesture = useCallback(() => {
    if (!isPointerDownRef.current && !isDraggingRef.current) return;
    isPointerDownRef.current = false;
    setDragProgress(null);

    const hadDragged = hasDraggedRef.current;
    const finalClosest = closestIndexRef.current;

    hasDraggedRef.current = false;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (onDragEndRef.current) {
      onDragEndRef.current(hadDragged, finalClosest);
    }

    if (hadDragged) {
      if (onSnapRef.current) {
        onSnapRef.current(finalClosest);
      }
    } else {
      syncGeometry(activeIndex);
    }
  }, [activeIndex, syncGeometry]);

  const handlePointerMove = (e: React.PointerEvent) => {
    processDragMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      const target = e.currentTarget as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    endDragGesture();
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    try {
      const target = e.currentTarget as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    endDragGesture();
  };

  // Listeners globais no window como rede de segurança para garantir término do arraste
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (isPointerDownRef.current) {
        processDragMove(e.clientX);
      }
    };
    const handleGlobalPointerUp = () => {
      if (isPointerDownRef.current || isDraggingRef.current) {
        endDragGesture();
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [processDragMove, endDragGesture]);

  return {
    isDragging,
    dragProgress,
    closestIndex,
    pillGeometry,
    syncGeometry,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
}

export interface UseSwipeActionOptions {
  threshold?: number;
  minOffset?: number;
  maxOffset?: number;
  disabled?: boolean;
  onSwipeTrigger?: () => void;
  onFilterPointerDown?: (e: React.PointerEvent) => boolean;
}

export interface UseSwipeActionReturn {
  isDragging: boolean;
  dragOffset: number;
  isThresholdReached: boolean;
  handlePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerCancel: () => void;
  reset: () => void;
}

/**
 * Hook para gesto de arrasto linear com limiar de ação horizontal (swipe-to-action).
 * Usado pelo gesto de arrastar para excluir em DatabaseRow.
 */
export function useSwipeAction({
  threshold = 50,
  minOffset = -110,
  maxOffset = 110,
  disabled = false,
  onSwipeTrigger,
  onFilterPointerDown,
}: UseSwipeActionOptions = {}): UseSwipeActionReturn {
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isThresholdReached, setIsThresholdReached] = useState<boolean>(false);

  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    hasMovedHorizontal: boolean;
    hasSwiped: boolean;
  } | null>(null);

  const onSwipeTriggerRef = useRef(onSwipeTrigger);
  onSwipeTriggerRef.current = onSwipeTrigger;
  const onFilterPointerDownRef = useRef(onFilterPointerDown);
  onFilterPointerDownRef.current = onFilterPointerDown;

  const reset = useCallback(() => {
    touchStateRef.current = null;
    setIsDragging(false);
    setIsThresholdReached(false);
    setDragOffset(0);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;

    if (onFilterPointerDownRef.current && !onFilterPointerDownRef.current(e)) {
      return;
    }

    touchStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      hasMovedHorizontal: false,
      hasSwiped: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchStateRef.current) return;
    const diffX = e.clientX - touchStateRef.current.startX;
    const diffY = e.clientY - touchStateRef.current.startY;

    if (!touchStateRef.current.hasMovedHorizontal) {
      if (Math.abs(diffX) > 6 && Math.abs(diffX) > Math.abs(diffY)) {
        touchStateRef.current.hasMovedHorizontal = true;
        setIsDragging(true);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // pointer capture opcional
        }
      } else if (Math.abs(diffY) > 8) {
        touchStateRef.current = null;
        return;
      }
    }

    if (touchStateRef.current?.hasMovedHorizontal) {
      const clampedX = Math.max(minOffset, Math.min(maxOffset, diffX));
      setDragOffset(clampedX);
      const reached = Math.abs(clampedX) >= threshold;
      touchStateRef.current.hasSwiped = reached;
      setIsThresholdReached(reached);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = touchStateRef.current;
    touchStateRef.current = null;
    setIsDragging(false);
    setIsThresholdReached(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignora
    }

    if (state?.hasSwiped && onSwipeTriggerRef.current) {
      onSwipeTriggerRef.current();
    }
    setDragOffset(0);
  };

  const handlePointerCancel = () => {
    reset();
  };

  return {
    isDragging,
    dragOffset,
    isThresholdReached,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    reset,
  };
}
