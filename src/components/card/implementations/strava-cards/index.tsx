import { useEffect, useState } from "react";
import { Platform, Text } from "react-native";
import { Card, cardStyles } from "../../";
import { styles } from "./styles";
import type { StravaData } from "./types";

const BASE_URL =
  Platform.OS === "web" ? "" : (process.env.EXPO_PUBLIC_API_URL ?? "");
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";

const stravaLogo = require("../../../../../assets/strava.png");

export const StravaCards = () => {
  const [data, setData] = useState<StravaData | null>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/.netlify/functions/strava`, {
      headers: { "x-api-key": API_KEY },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed");
        }
        return res.json() as Promise<StravaData>;
      })
      .then(setData)
      .catch(() => {
        setData(null);
      });
  }, []);

  const km = data ? `${data.totalDistanceKm.toFixed(1)} km` : "-";
  const pace = data ? `${data.totalAveragePace} /km` : "-";

  return (
    <>
      <Card span={1} title="Recent Distance" backgroundImage={stravaLogo}>
        <Text style={[cardStyles.bodyText, styles.value]}>{km}</Text>
      </Card>
      <Card span={1} title="Recent Pace" backgroundImage={stravaLogo}>
        <Text style={[cardStyles.bodyText, styles.value]}>{pace}</Text>
      </Card>
    </>
  );
};
