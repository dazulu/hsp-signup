import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { TrainingReminderPermissionStatus } from "./types";

export const ANDROID_CHANNEL_ID = "training-reminders";

let foregroundHandlerSet = false;
let androidChannelEnsured = false;

export const setForegroundNotificationHandler = (): void => {
  if (foregroundHandlerSet) {
    return;
  }
  foregroundHandlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

export const ensureAndroidChannel = async (): Promise<void> => {
  if (Platform.OS !== "android" || androidChannelEnsured) {
    return;
  }
  androidChannelEnsured = true;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Training reminders",
    importance: Notifications.AndroidImportance.HIGH,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
    showBadge: false,
    enableVibrate: true,
  });
};

const mapStatus = (
  status: Notifications.PermissionStatus,
): TrainingReminderPermissionStatus => {
  if (status === "granted") {
    return "granted";
  }
  if (status === "denied") {
    return "denied";
  }
  return "undetermined";
};

export const getNotificationPermissionStatus =
  async (): Promise<TrainingReminderPermissionStatus> => {
    const response = await Notifications.getPermissionsAsync();
    return mapStatus(response.status);
  };

export const requestNotificationPermission =
  async (): Promise<TrainingReminderPermissionStatus> => {
    const response = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });
    return mapStatus(response.status);
  };
