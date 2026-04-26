import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type StravaData = {
  totalDistanceKm: number;
  totalAveragePace: string;
  latestRun: { athleteName: string; distanceKm: number } | null;
};

const BASE_URL =
  Platform.OS === "web" ? "" : (process.env.EXPO_PUBLIC_API_URL ?? "");
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";

const CACHE_KEY = "app_strava_cache_v2";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const fetchStravaData = async (
  force = false,
): Promise<StravaData | null> => {
  let stale: StravaData | null = null;

  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as { ts: number; data: StravaData };
      if (!force && Date.now() - cached.ts < CACHE_TTL_MS) {
        return cached.data;
      }
      stale = cached.data;
    }
  } catch {
    // Corrupted cache — ignore and fetch fresh
  }

  try {
    const res = await fetch(`${BASE_URL}/.netlify/functions/strava`, {
      headers: { "x-api-key": API_KEY },
    });
    if (!res.ok) {
      throw new Error("Failed");
    }
    const fresh = (await res.json()) as StravaData;
    if (fresh.totalDistanceKm > 0) {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ts: Date.now(), data: fresh }),
      );
    }
    return fresh.totalDistanceKm > 0 ? fresh : stale;
  } catch (error) {
    console.log("Strava fetch error:", (error as Error).message);
    return stale;
  }
};
