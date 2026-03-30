import * as Updates from "expo-updates";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

export const useOtaUpdate = () => {
  const [updateReady, setUpdateReady] = useState(false);
  const appState = useRef(AppState.currentState);

  const checkForUpdate = useCallback(async () => {
    if (__DEV__) {
      return;
    }
    try {
      const { isAvailable } = await Updates.checkForUpdateAsync();
      if (isAvailable) {
        await Updates.fetchUpdateAsync();
        setUpdateReady(true);
      }
    } catch {
      // Silently ignore — network errors, etc.
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      setUpdateReady(false);
    }
  }, []);

  useEffect(() => {
    // Check once on mount (cold launch)
    checkForUpdate();

    // Check when app comes to foreground
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        checkForUpdate();
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, [checkForUpdate]);

  return { updateReady, applyUpdate };
};
