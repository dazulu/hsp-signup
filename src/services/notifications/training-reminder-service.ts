import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  ANDROID_CHANNEL_ID,
  ensureAndroidChannel,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  setForegroundNotificationHandler,
} from "./notification-permissions";
import { getNotificationContent } from "./training-reminder-content";
import {
  computeNextReminderDate,
  isBookedThisWeek,
  isSameInstant,
  isSportPausedForReminder,
} from "./training-reminder-rules";
import {
  loadReminderPreferences,
  loadReminderScheduleState,
  saveReminderPreferences,
  saveReminderScheduleState,
} from "./training-reminder-storage";
import type {
  SetTrainingReminderEnabledResult,
  TrainingReminderPermissionStatus,
  TrainingReminderPreferences,
  TrainingReminderScheduleState,
  TrainingReminderType,
} from "./types";

const REMINDER_TYPES: readonly TrainingReminderType[] = [
  "football",
  "hurling",
] as const;

type LastBookingRecord = {
  sport: TrainingReminderType;
  bookedAt: number;
};

const readLastBooking = async (): Promise<LastBookingRecord | null> => {
  const raw = await AsyncStorage.getItem("hsp_last_booking");
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      (parsed.sport === "football" || parsed.sport === "hurling") &&
      typeof parsed.bookedAt === "number"
    ) {
      return { sport: parsed.sport, bookedAt: parsed.bookedAt };
    }
  } catch {}
  return null;
};

const hasBookedSportThisWeek = async (
  type: TrainingReminderType,
  currentDate: Date,
): Promise<boolean> => {
  const lastBooking = await readLastBooking();
  if (!lastBooking || lastBooking.sport !== type) {
    return false;
  }
  return isBookedThisWeek(lastBooking.bookedAt, currentDate);
};

const cancelStoredReminder = async (
  state: TrainingReminderScheduleState,
  type: TrainingReminderType,
): Promise<TrainingReminderScheduleState> => {
  const storedId = state[type].notificationId;
  if (storedId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(storedId);
    } catch (error) {
      if (__DEV__) {
        console.warn(
          `[trainingReminders] Failed to cancel notification ${storedId}`,
          error,
        );
      }
    }
  }
  return {
    ...state,
    [type]: { notificationId: null, scheduledForIso: null },
  };
};

const scheduleReminder = async (
  type: TrainingReminderType,
  fireDate: Date,
): Promise<string> => {
  const { title, body } = await getNotificationContent(type);
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type, screen: "book" },
      ...(Platform.OS === "android" ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
    },
  });
};

let reconcileChain: Promise<void> = Promise.resolve();

// Remote pause state mirrored from Contentful via the bootstrap hook. Null
// means "not paused" or "not yet known". The service does not persist this:
// the bootstrap hook re-pushes the latest value on every app start and on
// every refresh of MobileAppDataContext.
type RemoteAvailability = {
  football: string | null;
  hurling: string | null;
};

let remoteAvailability: RemoteAvailability = {
  football: null,
  hurling: null,
};

export const setRemoteSportAvailability = (
  next: RemoteAvailability,
): Promise<void> => {
  if (
    next.football === remoteAvailability.football &&
    next.hurling === remoteAvailability.hurling
  ) {
    return Promise.resolve();
  }
  remoteAvailability = next;
  return reconcileTrainingReminders("remote-availability-changed");
};

const reconcileInternal = async (reason: string): Promise<void> => {
  if (Platform.OS === "web") {
    return;
  }

  const preferences = await loadReminderPreferences();
  const anyEnabled = preferences.football || preferences.hurling;

  if (!anyEnabled) {
    // No prefs on: avoid even touching the permission API so fresh-installed
    // and existing users see zero behaviour change until they opt in.
    const state = await loadReminderScheduleState();
    const hasAnyStored = REMINDER_TYPES.some(
      (type) =>
        state[type].notificationId !== null ||
        state[type].scheduledForIso !== null,
    );
    if (!hasAnyStored) {
      if (__DEV__) {
        logReconcile(reason, "noop-disabled", preferences, "undetermined");
      }
      return;
    }
    let nextState = state;
    for (const type of REMINDER_TYPES) {
      nextState = await cancelStoredReminder(nextState, type);
    }
    await saveReminderScheduleState(nextState);
    if (__DEV__) {
      logReconcile(reason, "cleared-disabled", preferences, "undetermined");
    }
    return;
  }

  const permissionStatus = await getNotificationPermissionStatus();
  const permissionGranted = permissionStatus === "granted";

  let state = await loadReminderScheduleState();
  const currentDate = new Date();

  try {
    for (const type of REMINDER_TYPES) {
      const enabled = preferences[type];

      if (!enabled || !permissionGranted) {
        state = await cancelStoredReminder(state, type);
        continue;
      }

      if (await hasBookedSportThisWeek(type, currentDate)) {
        state = await cancelStoredReminder(state, type);
        if (__DEV__) {
          console.log(
            `[trainingReminders] ${type}: booked this week, cancelled`,
          );
        }
        continue;
      }

      const nextReminderDate = computeNextReminderDate(currentDate, type);

      if (
        isSportPausedForReminder(remoteAvailability[type], nextReminderDate)
      ) {
        state = await cancelStoredReminder(state, type);
        if (__DEV__) {
          console.log(
            `[trainingReminders] ${type}: paused until ${remoteAvailability[type]}, cancelled`,
          );
        }
        continue;
      }

      if (nextReminderDate.getTime() <= currentDate.getTime()) {
        state = await cancelStoredReminder(state, type);
        continue;
      }

      if (isSameInstant(state[type].scheduledForIso, nextReminderDate)) {
        if (__DEV__) {
          console.log(
            `[trainingReminders] ${type}: already scheduled for ${nextReminderDate.toISOString()}, noop`,
          );
        }
        continue;
      }

      state = await cancelStoredReminder(state, type);
      const notificationId = await scheduleReminder(type, nextReminderDate);
      state = {
        ...state,
        [type]: {
          notificationId,
          scheduledForIso: nextReminderDate.toISOString(),
        },
      };
      if (__DEV__) {
        console.log(
          `[trainingReminders] ${type}: scheduled ${notificationId} for ${nextReminderDate.toISOString()}`,
        );
      }
    }
  } finally {
    // Persist whatever progress we made even if a per-sport step threw,
    // so the next reconcile starts from an accurate stored schedule.
    await saveReminderScheduleState(state);
  }

  if (__DEV__) {
    logReconcile(reason, "applied", preferences, permissionStatus);
  }
};

const logReconcile = (
  reason: string,
  outcome: string,
  preferences: TrainingReminderPreferences,
  permissionStatus: TrainingReminderPermissionStatus,
): void => {
  console.log(
    `[trainingReminders] reconcile reason=${reason} outcome=${outcome} permission=${permissionStatus} football=${preferences.football} hurling=${preferences.hurling}`,
  );
};

export const initialiseTrainingReminders = async (): Promise<void> => {
  if (Platform.OS === "web") {
    return;
  }
  setForegroundNotificationHandler();
  await ensureAndroidChannel();
};

export const reconcileTrainingReminders = (reason: string): Promise<void> => {
  // Serialise reconciliation so AppState bursts (e.g. modal dismiss) can't
  // race with a toggle flip and corrupt the stored schedule.
  const next = reconcileChain.then(() => reconcileInternal(reason));
  reconcileChain = next.catch((error) => {
    if (__DEV__) {
      console.warn("[trainingReminders] reconcile failed", error);
    }
  });
  return reconcileChain;
};

export const setTrainingReminderEnabled = async (
  type: TrainingReminderType,
  enabled: boolean,
): Promise<SetTrainingReminderEnabledResult> => {
  if (Platform.OS === "web") {
    return { success: true, permissionStatus: "undetermined" };
  }

  if (!enabled) {
    const preferences = await loadReminderPreferences();
    const next = { ...preferences, [type]: false };
    await saveReminderPreferences(next);
    await reconcileTrainingReminders(`toggle:${type}=false`);
    const permissionStatus = await getNotificationPermissionStatus();
    return { success: true, permissionStatus };
  }

  await ensureAndroidChannel();
  let permissionStatus = await getNotificationPermissionStatus();
  if (permissionStatus !== "granted") {
    permissionStatus = await requestNotificationPermission();
  }
  if (permissionStatus !== "granted") {
    return { success: false, reason: "permission_denied", permissionStatus };
  }

  const preferences = await loadReminderPreferences();
  const next = { ...preferences, [type]: true };
  await saveReminderPreferences(next);
  await reconcileTrainingReminders(`toggle:${type}=true`);
  return { success: true, permissionStatus };
};

export const onBookingChanged = (type: TrainingReminderType): Promise<void> =>
  reconcileTrainingReminders(`booking-changed:${type}`);

export const getTrainingReminderPreferences =
  (): Promise<TrainingReminderPreferences> => loadReminderPreferences();

export const getTrainingReminderPermissionStatus =
  async (): Promise<TrainingReminderPermissionStatus> => {
    if (Platform.OS === "web") {
      return "undetermined";
    }
    return getNotificationPermissionStatus();
  };

// Dev-only: cancels every OS-scheduled notification and wipes our stored
// schedule state. Preferences are left intact, so the next reconcile (e.g. on
// foreground) will re-schedule based on current settings. Intended for QA of
// the booking-suppression and idempotency rules.
export const clearAllTrainingReminders = async (): Promise<void> => {
  if (Platform.OS === "web") {
    return;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  await saveReminderScheduleState({
    football: { notificationId: null, scheduledForIso: null },
    hurling: { notificationId: null, scheduledForIso: null },
  });
};
