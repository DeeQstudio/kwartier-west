export type ZonedWindow = {
  timeZone: string;
  startDate: string;
  startTime: string;
  endTime: string;
};

function toDateKey(year: number, month: number, day: number) {
  return [year, month, day].map((part) => String(part).padStart(2, "0")).join("-");
}

function previousDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function timeToMinutes(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

function zonedParts(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    hour12: false,
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    dateKey: toDateKey(Number(values.year), Number(values.month), Number(values.day)),
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

export function isZonedWindowActive(window: ZonedWindow, now = new Date()) {
  const current = zonedParts(now, window.timeZone);
  const startMinutes = timeToMinutes(window.startTime);
  const endMinutes = timeToMinutes(window.endTime);

  if (endMinutes > startMinutes) {
    return current.dateKey === window.startDate && current.minutes >= startMinutes && current.minutes < endMinutes;
  }

  const previous = previousDateKey(current.dateKey);
  return (
    (current.dateKey === window.startDate && current.minutes >= startMinutes) ||
    (previous === window.startDate && current.minutes < endMinutes)
  );
}

export function hasZonedWindowEnded(window: ZonedWindow, now = new Date()) {
  const current = zonedParts(now, window.timeZone);
  const endMinutes = timeToMinutes(window.endTime);
  const previous = previousDateKey(current.dateKey);

  if (current.dateKey < window.startDate) return false;
  if (current.dateKey === window.startDate) return false;
  if (previous === window.startDate) return current.minutes >= endMinutes;
  return current.dateKey > window.startDate;
}
