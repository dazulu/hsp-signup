import type { TrainingReminderType } from "./types";

type ReminderConfig = {
  weekday: number;
  hour: number;
  minute: number;
};

// Weekday numbers follow JavaScript Date#getDay(): Sun=0, Mon=1, ..., Sat=6.
// Note: Android may defer fires by a few minutes
export const REMINDER_CONFIG: Record<TrainingReminderType, ReminderConfig> = {
  football: { weekday: 2, hour: 8, minute: 0 },
  hurling: { weekday: 4, hour: 8, minute: 0 },
};

// Week boundary: Sunday 00:00 local through Saturday 23:59 local.
export const getStartOfCurrentWeek = (currentDate: Date): Date => {
  const start = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek);
  return start;
};

export const isBookedThisWeek = (
  bookedAtMs: number,
  currentDate: Date,
): boolean => {
  const startOfWeek = getStartOfCurrentWeek(currentDate);
  return bookedAtMs >= startOfWeek.getTime();
};

export const computeNextReminderDate = (
  currentDate: Date,
  type: TrainingReminderType,
): Date => {
  const { weekday, hour, minute } = REMINDER_CONFIG[type];
  const candidate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    hour,
    minute,
    0,
    0,
  );
  const currentDayOfWeek = candidate.getDay();
  let daysAhead = (weekday - currentDayOfWeek + 7) % 7;
  if (daysAhead === 0 && candidate.getTime() <= currentDate.getTime()) {
    daysAhead = 7;
  }
  candidate.setDate(candidate.getDate() + daysAhead);
  return candidate;
};

export const isSameInstant = (
  storedIso: string | null,
  target: Date,
): boolean => {
  if (storedIso === null) {
    return false;
  }
  const storedMs = Date.parse(storedIso);
  if (Number.isNaN(storedMs)) {
    return false;
  }
  return storedMs === target.getTime();
};

// Mirrors the booking screen's pause check: a sport is paused for a given
// reminder fire-time if its remote "disabled until" timestamp is still in the
// future at that instant.
export const isSportPausedForReminder = (
  disabledUntilIso: string | null,
  reminderDate: Date,
): boolean => {
  if (!disabledUntilIso) {
    return false;
  }
  const disabledUntilMs = Date.parse(disabledUntilIso);
  if (Number.isNaN(disabledUntilMs)) {
    return false;
  }
  return disabledUntilMs > reminderDate.getTime();
};
