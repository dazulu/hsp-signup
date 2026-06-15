export {
  clearAllTrainingReminders,
  getTrainingReminderPermissionStatus,
  getTrainingReminderPreferences,
  initialiseTrainingReminders,
  onBookingChanged,
  reconcileTrainingReminders,
  setRemoteSportAvailability,
  setTrainingReminderEnabled,
} from "./training-reminder-service";
export type {
  SetTrainingReminderEnabledResult,
  TrainingReminderPermissionStatus,
  TrainingReminderPreferences,
  TrainingReminderType,
} from "./types";
