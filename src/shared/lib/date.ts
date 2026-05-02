export type DateRange = {
  start?: string;
  end?: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
});

export function isValidIsoDateTime(value: string): boolean {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

export function toLocalDateKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatDisplayTime(value: string): string {
  return timeFormatter.format(new Date(value));
}

export function toDateTimeLocalValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function fromDateTimeLocalValue(value: string): string {
  // Avoid iOS Safari bug: new Date("YYYY-MM-DDTHH:MM") is parsed as UTC on iOS.
  // Using the multi-arg constructor always creates a local-time Date.
  const [datePart, timePart = '00:00'] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

export function addLocalDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function dateOnlyToStartIso(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0).toISOString();
}

export function dateOnlyToExclusiveEndIso(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  return addLocalDays(new Date(year, month - 1, day), 1).toISOString();
}

export function combineDateAndTimeToIso(dateOnly: string, timeOnly: string): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  const [hours, minutes] = timeOnly.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}
