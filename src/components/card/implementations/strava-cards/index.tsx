import { Text } from "react-native";
import { useMobileAppData } from "../../../../context/mobile-app-data";
import { useLocale } from "../../../../i18n";
import { Card, cardStyles } from "../../";
import { styles } from "./styles";

const stravaLogo = require("../../../../../assets/strava.png");

export const StravaCards = () => {
  const { t } = useLocale();
  const { stravaData } = useMobileAppData();

  const km = stravaData ? `${stravaData.totalDistanceKm.toFixed(1)} km` : "-";
  const pace = stravaData ? `${stravaData.totalAveragePace} /km` : "-";

  return (
    <>
      <Card
        backgroundImage={stravaLogo}
        span={1}
        title={t("card.strava.distance")}
        tooltipText={t("card.strava.tooltip")}
        tooltipLinkUrl={t("card.strava.tooltip.link.url")}
        tooltipLinkText={t("card.strava.tooltip.link.text")}
      >
        <Text style={[cardStyles.bodyText, styles.value]}>{km}</Text>
      </Card>
      <Card
        backgroundImage={stravaLogo}
        span={1}
        title={t("card.strava.pace")}
        tooltipText={t("card.strava.tooltip")}
        tooltipLinkUrl={t("card.strava.tooltip.link.url")}
        tooltipLinkText={t("card.strava.tooltip.link.text")}
      >
        <Text style={[cardStyles.bodyText, styles.value]}>{pace}</Text>
      </Card>
    </>
  );
};
