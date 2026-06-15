import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";
import { useMobileAppData } from "../context/mobile-app-data";
import {
  initialiseTrainingReminders,
  reconcileTrainingReminders,
  setRemoteSportAvailability,
} from "../services/notifications";

export const useTrainingReminderBootstrap = (): void => {
  const lastReconcileAtRef = useRef(0);
  const { data } = useMobileAppData();
  const footballDisabledUntil = data?.booking?.gaelicDisabledUntil ?? null;
  const hurlingDisabledUntil = data?.booking?.hurlingDisabledUntil ?? null;

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    setRemoteSportAvailability({
      football: footballDisabledUntil,
      hurling: hurlingDisabledUntil,
    });
  }, [footballDisabledUntil, hurlingDisabledUntil]);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    let cancelled = false;

    (async () => {
      await initialiseTrainingReminders();
      if (cancelled) {
        return;
      }
      lastReconcileAtRef.current = Date.now();
      await reconcileTrainingReminders("app-start");
    })();

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== "active") {
        return;
      }
      // Debounce: AppState fires for modal/lockscreen dismiss bursts.
      const now = Date.now();
      if (now - lastReconcileAtRef.current < 30_000) {
        return;
      }
      lastReconcileAtRef.current = now;
      reconcileTrainingReminders("app-foreground");
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);
};
