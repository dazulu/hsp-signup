import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Platform, Text } from "react-native";
import { useLocale } from "../../../../i18n";
import { Card, cardStyles } from "../../";
import { styles } from "./styles";
import type { StravaData } from "./types";

const BASE_URL =
  Platform.OS === "web" ? "" : (process.env.EXPO_PUBLIC_API_URL ?? "");
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";

const CACHE_KEY = "hsp_strava_cache";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const stravaLogo = require("../../../../../assets/strava.png");

export const StravaCards = () => {
  const { t } = useLocale();
  const [data, setData] = useState<StravaData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      let stale: StravaData | null = null;

      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as { ts: number; data: StravaData };
          if (Date.now() - cached.ts < CACHE_TTL_MS) {
            setData(cached.data);
            return;
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
        const now = Date.now();
        setData(fresh);
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ ts: now, data: fresh }),
        );
      } catch {
        setData(stale);
      }
    };

    loadData();
  }, []);

  const km = data ? `${data.totalDistanceKm.toFixed(1)} km` : "-";
  const pace = data ? `${data.totalAveragePace} /km` : "-";

  return (
    <>
      <Card
        span={1}
        title={t("card.strava.distance")}
        backgroundImage={stravaLogo}
      >
        <Text style={[cardStyles.bodyText, styles.value]}>{km}</Text>
      </Card>
      <Card span={1} title={t("card.strava.pace")} backgroundImage={stravaLogo}>
        <Text style={[cardStyles.bodyText, styles.value]}>{pace}</Text>
      </Card>
    </>
  );
};
