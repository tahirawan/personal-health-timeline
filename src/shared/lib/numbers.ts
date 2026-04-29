export function average(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

export function minValue(values: number[]): number | undefined {
  return values.length > 0 ? Math.min(...values) : undefined;
}

export function maxValue(values: number[]): number | undefined {
  return values.length > 0 ? Math.max(...values) : undefined;
}

export function displayNumber(value: number | undefined): string {
  return value === undefined ? 'Not enough data' : String(value);
}
