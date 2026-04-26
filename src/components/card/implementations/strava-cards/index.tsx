import { Text, View } from "react-native";
import { useMobileAppData } from "../../../../context/mobile-app-data";
import { useLocale } from "../../../../i18n";
import { Card, cardStyles } from "../../";
import { styles } from "./styles";

export const StravaCards = () => {
  const { t } = useLocale();
  const { stravaData } = useMobileAppData();

  const km = stravaData ? `${stravaData.totalDistanceKm.toFixed(1)} km` : "-";
  const pace = stravaData ? `${stravaData.totalAveragePace} /km` : "-";
  const latestRun = stravaData?.latestRun ?? null;

  return (
    <Card
      span={2}
      title={t("card.strava.club")}
      tooltipText={t("card.strava.tooltip")}
      tooltipLinkUrl={t("card.strava.tooltip.link.url")}
      tooltipLinkText={t("card.strava.tooltip.link.text")}
    >
      <View style={styles.statsList}>
        <View style={styles.statRow}>
          <Text style={[cardStyles.bodyText, styles.statLabel]}>
            {t("card.strava.distance")}
          </Text>
          <Text style={[cardStyles.bodyText, styles.statValue]}>{km}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[cardStyles.bodyText, styles.statLabel]}>
            {t("card.strava.pace")}
          </Text>
          <Text style={[cardStyles.bodyText, styles.statValue]}>{pace}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[cardStyles.bodyText, styles.statLabel]}>
            {t("card.strava.latest.run")}{" "}
            {latestRun ? `(${latestRun.athleteName})` : ""}
          </Text>
          {latestRun ? (
            <Text style={[cardStyles.bodyText, styles.statValue]}>
              {parseFloat(latestRun.distanceKm.toFixed(1))} km
            </Text>
          ) : (
            <Text style={[cardStyles.bodyText, styles.statValue]}>-</Text>
          )}
        </View>
      </View>
    </Card>
  );
};
