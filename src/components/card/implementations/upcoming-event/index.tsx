import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { useMobileAppData } from "../../../../context/mobile-app-data";
import { useLocale } from "../../../../i18n";
import type { ClubStackParamList } from "../../../../navigation/types";
import type { ContentfulItem } from "../../../../services/contentful/types";
import { theme } from "../../../../theme";
import {
  formatEventDate,
  getEventCountdownDays,
  isDateInPast,
  isValidEventDate,
  sortContentfulEventsByDate,
} from "../../../../utils";
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

  const footballFirst: ContentfulItem | undefined = events?.football.find(
    (item) => isValidEventDate(item.value) && !isDateInPast(item.value),
  );
  const hurlingFirst: ContentfulItem | undefined = events?.hurling.find(
    (item) => isValidEventDate(item.value) && !isDateInPast(item.value),
  );

  if (!footballFirst && !hurlingFirst) {
    return null;
  }

  const sortedEvents = sortContentfulEventsByDate(
    [footballFirst, hurlingFirst].filter(
      (item): item is ContentfulItem => item !== undefined,
    ),
  ).map((item) => ({
    item,
    sport: (item === footballFirst ? "football" : "hurling") as
      | "football"
      | "hurling",
  }));

  return (
    <Card
      span={2}
      title={t("card.upcoming.title")}
      onPress={() => navigation.navigate("UpcomingEvents")}
    >
      <View style={styles.content}>
        {sortedEvents.map(({ item, sport }) => {
          const days = getEventCountdownDays(item.value);
          const countdown = buildCountdownLabel(days, t);
          return (
            <View key={sport} style={styles.row}>
              <Ionicons
                style={styles.rowIcon}
                name="trophy"
                size={15}
                color={colors.textMuted}
              />
              <Text style={[cardStyles.bodyText, styles.rowText]}>
                {t(`upcoming.${sport}`)} · {item.key} ·{" "}
                {formatEventDate(item.value, locale)}
              </Text>
              {countdown ? (
                <View style={[styles.pill, days === 0 && styles.pillToday]}>
                  <Text
                    style={[
                      styles.pillText,
                      days === 0 && styles.pillTextToday,
                    ]}
                  >
                    {countdown}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </Card>
  );
};
