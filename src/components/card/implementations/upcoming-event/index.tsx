import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { useMobileAppData } from "../../../../context/mobile-app-data";
import { useLocale } from "../../../../i18n";
import type { ClubStackParamList } from "../../../../navigation/types";
import type { ContentfulItem } from "../../../../services/contentful/types";
import { theme } from "../../../../theme";
import { formatEventDate, getEventCountdownDays } from "../../../../utils";
import { Card, cardStyles } from "../../";
import { styles } from "./styles";

const { colors } = theme;

type TranslateFn = ReturnType<typeof useLocale>["t"];

const buildCountdownLabel = (
  days: number | null,
  t: TranslateFn,
): string | null => {
  if (days === null) {
    return null;
  }
  if (days === 0) {
    return t("card.upcoming.today");
  }
  if (days === 1) {
    return t("card.upcoming.tomorrow");
  }
  return t("card.upcoming.daysToGo", { days });
};

export const UpcomingEventCard = () => {
  const { t, locale } = useLocale();
  const navigation =
    useNavigation<NativeStackNavigationProp<ClubStackParamList>>();
  const { events } = useMobileAppData();

  const footballFirst: ContentfulItem | undefined = events?.football[0];
  const hurlingFirst: ContentfulItem | undefined = events?.hurling[0];

  if (!footballFirst && !hurlingFirst) {
    return null;
  }

  const footballCountdown = footballFirst
    ? buildCountdownLabel(getEventCountdownDays(footballFirst.value), t)
    : null;
  const hurlingCountdown = hurlingFirst
    ? buildCountdownLabel(getEventCountdownDays(hurlingFirst.value), t)
    : null;

  return (
    <Card
      span={2}
      title={t("card.upcoming.title")}
      onPress={() => navigation.navigate("UpcomingEvents")}
    >
      <View style={styles.content}>
        {footballFirst && (
          <View style={styles.row}>
            <Ionicons
              style={styles.rowIcon}
              name="trophy"
              size={15}
              color={colors.textMuted}
            />
            <Text style={[cardStyles.bodyText, styles.rowText]}>
              {t("upcoming.football")} · {footballFirst.key} ·{" "}
              {formatEventDate(footballFirst.value, locale)}
            </Text>
            {footballCountdown ? (
              <View style={styles.pill}>
                <Text style={styles.pillText}>{footballCountdown}</Text>
              </View>
            ) : null}
          </View>
        )}
        {hurlingFirst && (
          <View style={styles.row}>
            <Ionicons
              style={styles.rowIcon}
              name="trophy"
              size={15}
              color={colors.textMuted}
            />
            <Text style={[cardStyles.bodyText, styles.rowText]}>
              {t("upcoming.hurling")} · {hurlingFirst.key} ·{" "}
              {formatEventDate(hurlingFirst.value, locale)}
            </Text>
            {hurlingCountdown ? (
              <View style={styles.pill}>
                <Text style={styles.pillText}>{hurlingCountdown}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </Card>
  );
};
