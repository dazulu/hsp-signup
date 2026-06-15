import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";
import type { TabParamList } from "../navigation/types";

type NavigationRef = NavigationContainerRefWithCurrent<TabParamList>;

const handleResponse = async (
  response: Notifications.NotificationResponse,
  navigationRef: NavigationRef,
): Promise<void> => {
  const rawData = response.notification.request.content.data as
    | { type?: unknown; screen?: unknown }
    | undefined;
  const sport = rawData?.type;
  if (sport === "football" || sport === "hurling") {
    // Persist before navigating so a cold-start mount of BookScreen reads the
    // correct sport, and a warm focus-sync picks it up on the active screen.
    await AsyncStorage.setItem("hsp_sport", sport);
  }
  if (navigationRef.isReady()) {
    navigationRef.navigate("Book");
  }
};

export const useNotificationDeepLink = (navigationRef: NavigationRef): void => {
  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    let cancelled = false;

    // Cold-start: app was launched by tapping the notification. The container
    // is usually ready by the time this effect runs, but defer a tick to be
    // safe on slower devices.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (cancelled || !response) {
        return;
      }
      setTimeout(() => {
        if (cancelled) {
          return;
        }
        handleResponse(response, navigationRef);
      }, 100);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleResponse(response, navigationRef);
      },
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [navigationRef]);
};
