import { useEffect, useState } from 'react';

type ChartHeightOptions = {
  compact: boolean;
  expandedView: boolean;
};

type ViewportSize = {
  height: number;
  width: number;
};

const defaultViewportSize: ViewportSize = {
  height: 768,
  width: 1024,
};

export function useChartHeight({ compact, expandedView }: ChartHeightOptions): number {
  const viewportSize = useViewportSize(expandedView);
  const rotateMobileChart = useRotatedMobileChart(expandedView);

  if (expandedView && rotateMobileChart) {
    return clamp(viewportSize.width - 150, 220, 430);
  }

  if (expandedView) {
    return clamp(viewportSize.height - 168, 220, 520);
  }

  return compact ? 190 : 270;
}

export function useRotatedMobileChart(expandedView: boolean): boolean {
  const viewportSize = useViewportSize(expandedView);

  if (!expandedView || typeof window === 'undefined') {
    return false;
  }

  const mobilePointer =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;
  const narrowViewport = viewportSize.width <= 700;
  const portraitViewport = viewportSize.width < viewportSize.height;

  return portraitViewport && (mobilePointer || narrowViewport);
}

function useViewportSize(enabled: boolean): ViewportSize {
  const [viewportSize, setViewportSize] = useState(getViewportSize);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleResize = () => setViewportSize(getViewportSize());

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  return viewportSize;
}

function getViewportSize(): ViewportSize {
  if (typeof window === 'undefined') {
    return defaultViewportSize;
  }

  return {
    height: window.visualViewport?.height ?? window.innerHeight ?? defaultViewportSize.height,
    width: window.visualViewport?.width ?? window.innerWidth ?? defaultViewportSize.width,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
