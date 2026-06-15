import type { SportKey } from "../../hooks/use-booking";

export type TrainingReminderType = SportKey;

export type TrainingReminderPreferences = Record<TrainingReminderType, boolean>;

export type TrainingReminderScheduleEntry = {
  notificationId: string | null;
  scheduledForIso: string | null;
};

export type TrainingReminderScheduleState = Record<
  TrainingReminderType,
  TrainingReminderScheduleEntry
>;

export type TrainingReminderPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined";

export type SetTrainingReminderEnabledResult =
  | {
      success: true;
      permissionStatus: TrainingReminderPermissionStatus;
    }
  | {
      success: false;
      reason: "permission_denied";
      permissionStatus: TrainingReminderPermissionStatus;
    };
