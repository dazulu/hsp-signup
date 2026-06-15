import { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";
import {
  getTrainingReminderPermissionStatus,
  getTrainingReminderPreferences,
  type SetTrainingReminderEnabledResult,
  setTrainingReminderEnabled,
  type TrainingReminderPermissionStatus,
  type TrainingReminderPreferences,
  type TrainingReminderType,
} from "../services/notifications";

const DEFAULT_PREFERENCES: TrainingReminderPreferences = {
  football: false,
  hurling: false,
};

type UseTrainingRemindersResult = {
  ready: boolean;
  preferences: TrainingReminderPreferences;
  permissionStatus: TrainingReminderPermissionStatus;
  setEnabled: (
    type: TrainingReminderType,
    enabled: boolean,
  ) => Promise<SetTrainingReminderEnabledResult>;
};

export const useTrainingReminders = (): UseTrainingRemindersResult => {
  const [ready, setReady] = useState(false);
  const [preferences, setPreferences] =
    useState<TrainingReminderPreferences>(DEFAULT_PREFERENCES);
  const [permissionStatus, setPermissionStatus] =
    useState<TrainingReminderPermissionStatus>("undetermined");

  const refresh = useCallback(async () => {
    if (Platform.OS === "web") {
      setReady(true);
      return;
    }
    const [nextPreferences, nextStatus] = await Promise.all([
      getTrainingReminderPreferences(),
      getTrainingReminderPermissionStatus(),
    ]);
    setPreferences(nextPreferences);
    setPermissionStatus(nextStatus);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          refresh();
        }
      },
    );
    return () => subscription.remove();
  }, [refresh]);

  const setEnabled = useCallback(
    async (type: TrainingReminderType, enabled: boolean) => {
      // Optimistic update so the Switch responds instantly; revert on denial.
      setPreferences((prev) => ({ ...prev, [type]: enabled }));
      const result = await setTrainingReminderEnabled(type, enabled);
      setPermissionStatus(result.permissionStatus);
      if (!result.success) {
        setPreferences((prev) => ({ ...prev, [type]: false }));
      }
      return result;
    },
    [],
  );

  return { ready, preferences, permissionStatus, setEnabled };
};
