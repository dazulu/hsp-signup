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
