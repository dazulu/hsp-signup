import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import type { WhatsNewItem } from "../whats-new/content";
import { WHATS_NEW_ITEMS, WHATS_NEW_VERSION } from "../whats-new/content";

const SEEN_VERSION_KEY = "app_whats_new_seen_version";
const HAS_OPENED_KEY = "app_has_opened_before";

type UseWhatsNewResult = {
  hasUnseen: boolean;
  items: WhatsNewItem[];
  markSeen: () => void;
};

export const useWhatsNew = (): UseWhatsNewResult => {
  // While loading, hasUnseen is false to avoid a flash-of-dot on cold start.
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    // Web is a no-op for this feature.
    if (Platform.OS === "web") {
      return;
    }

    let cancelled = false;

    const load = async () => {
      const pairs = await AsyncStorage.multiGet([
        SEEN_VERSION_KEY,
        HAS_OPENED_KEY,
      ]);

      if (cancelled) {
        return;
      }

      const seenVersionValue = pairs[0][1];
      const hasOpenedValue = pairs[1][1];

      if (seenVersionValue === null && hasOpenedValue === null) {
        // Fresh install — seed the seen version so the dot never shows on
        // first launch. Do not touch app_has_opened_before; that key belongs
        // to useWelcomeText exclusively.
        await AsyncStorage.setItem(SEEN_VERSION_KEY, String(WHATS_NEW_VERSION));
        // hasUnseen stays false for this session.
        return;
      }

      // Treat a missing seen version (existing user upgrading into this feature
      // for the first time) as version 0 so the dot correctly appears.
      const storedVersion =
        seenVersionValue !== null ? parseInt(seenVersionValue, 10) : 0;

      if (!cancelled) {
        setHasUnseen(WHATS_NEW_VERSION > storedVersion);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const markSeen = () => {
    if (Platform.OS === "web") {
      return;
    }
    AsyncStorage.setItem(SEEN_VERSION_KEY, String(WHATS_NEW_VERSION));
    setHasUnseen(false);
  };

  if (Platform.OS === "web") {
    return { hasUnseen: false, items: [], markSeen };
  }

  return { hasUnseen, items: WHATS_NEW_ITEMS, markSeen };
};
