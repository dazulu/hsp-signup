import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  ContentfulAsset,
  ContentfulAssetLink,
  ContentfulCollection,
  ContentfulImageInfo,
  ContentfulItem,
  ContentfulQueryParams,
  Gallery,
  GalleryFields,
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

// --- Gallery ---

const GALLERY_CACHE_PREFIX = "app_gallery_cache_";
const GALLERY_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const resolveAssetLink = (
  link: ContentfulAssetLink,
  assets: ContentfulAsset[],
): ContentfulImageInfo | null => {
  const asset = assets.find((asset) => asset.sys.id === link.sys.id);
  if (!asset) {
    return null;
  }
  const { file, title } = asset.fields;
  return {
    id: asset.sys.id,
    url: file.url.startsWith("//") ? `https:${file.url}` : file.url,
    width: file.details.image.width,
    height: file.details.image.height,
    title: title ?? "",
  };
};

export const fetchGalleries = async (
  locale = "en",
  force = false,
): Promise<Gallery[]> => {
  const cacheKey = `${GALLERY_CACHE_PREFIX}${locale}`;
  let stale: Gallery[] | null = null;

  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (raw) {
      const cached = JSON.parse(raw) as { ts: number; data: Gallery[] };
      if (!force && Date.now() - cached.ts < GALLERY_CACHE_TTL_MS) {
        return cached.data;
      }
      stale = cached.data;
    }
  } catch {
    // Corrupted cache — ignore and fetch fresh
  }

  try {
    const response = await fetchContentful<GalleryFields>({
      content_type: "gallery",
      order: "-fields.date",
      include: 1,
      locale,
    });

    const assets = response.includes?.Asset ?? [];

    const galleries = response.items
      .map((entry): Gallery | null => {
        const { title, description, date, cover, items } = entry.fields;
        const resolvedCover = resolveAssetLink(cover, assets);
        if (!resolvedCover) {
          return null;
        }

        const resolvedItems = items
          .map((item) => resolveAssetLink(item, assets))
          .filter((img): img is ContentfulImageInfo => img !== null);

        const gallery: Gallery = {
          id: entry.sys.id,
          title,
          date,
          year: new Date(date).getFullYear(),
          cover: resolvedCover,
          items: resolvedItems,
        };
        if (description) {
          gallery.description = description;
        }
        return gallery;
      })
      .filter((gallery): gallery is Gallery => gallery !== null);

    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ ts: Date.now(), data: galleries }),
    );
    return galleries;
  } catch (error) {
    if (stale !== null) {
      return stale;
    }
    throw error;
  }
};
