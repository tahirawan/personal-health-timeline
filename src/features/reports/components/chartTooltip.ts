import type { CSSProperties } from 'react';

export const chartLineConfigs = [
  {
    key: 'systolic',
    label: 'Systolic',
    stroke: '#ef4444',
    strokeWidth: 3,
    legendClass: 'h-2.5 w-2.5 rounded-full bg-[#ef4444]',
  },
  {
    key: 'diastolic',
    label: 'Diastolic',
    stroke: '#38bdf8',
    strokeWidth: 3,
    legendClass: 'h-2.5 w-2.5 rounded-full bg-[#38bdf8]',
  },
  {
    key: 'pulse',
    label: 'Pulse',
    stroke: '#c084fc',
    strokeWidth: 2,
    legendClass: 'h-2.5 w-2.5 rounded-full bg-[#c084fc]',
  },
] as const;

const metricLabels: Record<string, string> = {
  systolic: 'Systolic',
  diastolic: 'Diastolic',
  pulse: 'Pulse',
};

const metricOrder: Record<string, number> = {
  systolic: 1,
  diastolic: 2,
  pulse: 3,
};

export const chartTooltipContentStyle: CSSProperties = {
  background: 'linear-gradient(145deg, rgb(255 255 255 / 96%), rgb(235 248 244 / 90%))',
  border: '1px solid rgb(255 255 255 / 42%)',
  borderRadius: '18px',
  boxShadow: '0 18px 44px rgb(6 21 28 / 24%)',
  color: '#211a33',
  padding: '12px 14px',
  backdropFilter: 'blur(14px)',
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: '#6e647d',
  fontWeight: 800,
  marginBottom: 8,
};

export const chartTooltipItemStyle: CSSProperties = {
  color: '#211a33',
  fontWeight: 800,
  paddingTop: 4,
  paddingBottom: 4,
};

export const chartTooltipWrapperStyle: CSSProperties = {
  outline: 'none',
};

export const chartTooltipCursor = {
  stroke: 'rgb(255 255 255 / 34%)',
  strokeWidth: 2,
};

export function getChartMetricLabel(name: unknown): string {
  const key = getMetricKey(name);
  return metricLabels[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function sortChartTooltipItems(item: { dataKey?: unknown; name?: unknown }): number {
  const key = getMetricKey(item.dataKey) || getMetricKey(item.name);
  return metricOrder[key] ?? 99;
}

export function formatChartTick(value: unknown): string {
  const date = getDate(value);

  if (!date) {
    return getFallbackText(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatChartTooltipLabel(value: unknown): string {
  const date = getDate(value);

  if (!date) {
    return getFallbackText(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

function getFallbackText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

function getMetricKey(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return '';
}
