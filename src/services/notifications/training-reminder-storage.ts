import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  TrainingReminderPreferences,
  TrainingReminderScheduleState,
} from "./types";

const PREFS_KEY = "app_training_reminder_prefs";
const STATE_KEY = "app_training_reminder_state";

const DEFAULT_PREFERENCES: TrainingReminderPreferences = {
  football: false,
  hurling: false,
};

const DEFAULT_SCHEDULE_STATE: TrainingReminderScheduleState = {
  football: { notificationId: null, scheduledForIso: null },
  hurling: { notificationId: null, scheduledForIso: null },
};

const parseJsonOrNull = (raw: string | null, key: string): unknown => {
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    if (__DEV__) {
      console.warn(
        `[trainingReminders] Failed to parse stored value for ${key}; falling back to defaults`,
      );
    }
    return null;
  }
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readBoolean = (value: unknown): boolean =>
  typeof value === "boolean" ? value : false;

const stringOrNull = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

export const loadReminderPreferences =
  async (): Promise<TrainingReminderPreferences> => {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    const parsed = parseJsonOrNull(raw, PREFS_KEY);
    if (!isPlainObject(parsed)) {
      return { ...DEFAULT_PREFERENCES };
    }
    // Tolerates both the current `{football, hurling}` shape and the legacy
    // `{footballEnabled, hurlingEnabled}` shape so existing installs are not
    // silently reset on upgrade.
    return {
      football: readBoolean(parsed.football ?? parsed.footballEnabled),
      hurling: readBoolean(parsed.hurling ?? parsed.hurlingEnabled),
    };
  };

export const saveReminderPreferences = async (
  preferences: TrainingReminderPreferences,
): Promise<void> => {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
};

export const loadReminderScheduleState =
  async (): Promise<TrainingReminderScheduleState> => {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    const parsed = parseJsonOrNull(raw, STATE_KEY);
    if (!isPlainObject(parsed)) {
      return {
        football: { ...DEFAULT_SCHEDULE_STATE.football },
        hurling: { ...DEFAULT_SCHEDULE_STATE.hurling },
      };
    }
    // Tolerates both the current nested shape and the legacy flat shape
    // (`footballNotificationId`, `footballScheduledForIso`, etc.).
    const football = isPlainObject(parsed.football) ? parsed.football : null;
    const hurling = isPlainObject(parsed.hurling) ? parsed.hurling : null;
    return {
      football: {
        notificationId: stringOrNull(
          football?.notificationId ?? parsed.footballNotificationId,
        ),
        scheduledForIso: stringOrNull(
          football?.scheduledForIso ?? parsed.footballScheduledForIso,
        ),
      },
      hurling: {
        notificationId: stringOrNull(
          hurling?.notificationId ?? parsed.hurlingNotificationId,
        ),
        scheduledForIso: stringOrNull(
          hurling?.scheduledForIso ?? parsed.hurlingScheduledForIso,
        ),
      },
    };
  };

export const saveReminderScheduleState = async (
  state: TrainingReminderScheduleState,
): Promise<void> => {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
};
