import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  ContentfulCollection,
  ContentfulItem,
  ContentfulQueryParams,
  MobileAppData,
  MobileAppDataFields,
  RepeatingItemsFields,
} from "./types";

const SPACE_ID = process.env.EXPO_PUBLIC_CONTENTFUL_SPACE_ID ?? "";
const ACCESS_TOKEN = process.env.EXPO_PUBLIC_CONTENTFUL_ACCESS_TOKEN ?? "";
const BASE_URL = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master`;

const CACHE_KEY = "app_contentful_events";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export type EventsData = {
  hurling: ContentfulItem[];
  football: ContentfulItem[];
};

export const fetchContentful = async <TFields>(
  params: ContentfulQueryParams,
): Promise<ContentfulCollection<TFields>> => {
  const query = new URLSearchParams();
  query.set("access_token", ACCESS_TOKEN);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  }

  const res = await fetch(`${BASE_URL}/entries?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Contentful ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<ContentfulCollection<TFields>>;
};

const fetchRepeatingItems = async (
  staticId: string,
): Promise<ContentfulItem[] | null> => {
  const data = await fetchContentful<RepeatingItemsFields>({
    content_type: "repeatingItems",
    "fields.staticId": staticId,
    limit: 1,
  });
  return (data.items[0]?.fields.items as ContentfulItem[]) ?? null;
};

export const fetchMobileAppData = async (): Promise<MobileAppData | null> => {
  try {
    const data = await fetchContentful<MobileAppDataFields>({
      content_type: "mobileAppData",
      "fields.staticId": "MOBILE_APP_DATA",
      limit: 1,
    });
    return data.items[0]?.fields.jsonData ?? null;
  } catch {
    return null;
  }
};

export const fetchEvents = async (
  force = false,
): Promise<EventsData | null> => {
  let stale: EventsData | null = null;

  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as { ts: number; data: EventsData };
      if (!force && Date.now() - cached.ts < CACHE_TTL_MS) {
        return cached.data;
      }
      stale = cached.data;
    }
  } catch {
    // Corrupted cache — ignore and fetch fresh
  }

  try {
    const [hurling, football] = await Promise.all([
      fetchRepeatingItems("HURLING_CAMOGIE_EVENTS_2026"),
      fetchRepeatingItems("GAELIC_FOOTBALL_EVENTS_2026"),
    ]);
    const data: EventsData = {
      hurling: hurling ?? [],
      football: football ?? [],
    };
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), data }),
    );
    return data;
  } catch {
    return stale;
  }
};
