import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import {
  type EventsData,
  fetchEvents,
  fetchMobileAppData,
} from "../services/contentful";
import type { MobileAppData } from "../services/contentful/types";
import { fetchStravaData, type StravaData } from "../services/strava";

type MobileAppDataContextValue = {
  data: MobileAppData | null;
  events: EventsData | null;
  stravaData: StravaData | null;
  loading: boolean;
  refresh: (force?: boolean) => Promise<void>;
  refreshContentful: () => Promise<void>;
};

const MobileAppDataContext = createContext<
  MobileAppDataContextValue | undefined
>(undefined);

export const MobileAppDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<MobileAppData | null>(null);
  const [events, setEvents] = useState<EventsData | null>(null);
  const [stravaData, setStravaData] = useState<StravaData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchingRef = useRef(false);

  const refresh = useCallback(async (force = false): Promise<void> => {
    if (fetchingRef.current) {
      return Promise.resolve();
    }
    fetchingRef.current = true;
    setLoading(true);

    try {
      const fetches: Promise<unknown>[] = [fetchMobileAppData()];
      if (Platform.OS !== "web") {
        fetches.push(fetchEvents(force), fetchStravaData(force));
      }

      const results = await Promise.allSettled(fetches);

      const [appDataResult, eventsResult, stravaResult] = results;
      if (appDataResult.status === "fulfilled") {
        setData(appDataResult.value as MobileAppData | null);
      }
      if (eventsResult?.status === "fulfilled") {
        setEvents(eventsResult.value as EventsData | null);
      }
      if (stravaResult?.status === "fulfilled") {
        setStravaData(stravaResult.value as StravaData | null);
      }
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  const refreshContentful = useCallback(async (): Promise<void> => {
    if (fetchingRef.current) {
      return;
    }
    const [appDataResult, eventsResult] = await Promise.allSettled([
      fetchMobileAppData(),
      fetchEvents(false),
    ]);
    if (appDataResult.status === "fulfilled") {
      setData(appDataResult.value as MobileAppData | null);
    }
    if (eventsResult.status === "fulfilled") {
      setEvents(eventsResult.value as EventsData | null);
    }
  }, []);

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  return (
    <MobileAppDataContext.Provider
      value={{ data, events, stravaData, loading, refresh, refreshContentful }}
    >
      {children}
    </MobileAppDataContext.Provider>
  );
};

export const useMobileAppData = (): MobileAppDataContextValue => {
  const ctx = useContext(MobileAppDataContext);
  if (!ctx) {
    throw new Error(
      "useMobileAppData must be used within MobileAppDataProvider",
    );
  }
  return ctx;
};
