import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocale } from "../../../../i18n";
import type { TabParamList } from "../../../../navigation/types";
import { type EventsData, fetchEvents } from "../../../../services/contentful";
import { theme } from "../../../../theme";
import { Card, cardStyles } from "../../";
import { styles } from "./styles";

const { colors } = theme;

export const UpcomingEventCard = () => {
  const { t } = useLocale();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [events, setEvents] = useState<EventsData | null>(null);

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  const footballFirst = events?.football[0];
  const hurlingFirst = events?.hurling[0];

  return (
    <Card
      span={2}
      title={t("card.upcoming.title")}
      onPress={() =>
        navigation.navigate("UpcomingEvents", { events: events ?? undefined })
      }
    >
      <View style={styles.content}>
        {footballFirst && (
          <View style={styles.row}>
            <Ionicons name="trophy" size={16} color={colors.textMuted} />
            <Text style={cardStyles.bodyText}>
              Gaelic Football · {footballFirst.key} · {footballFirst.value}
            </Text>
          </View>
        )}
        {hurlingFirst && (
          <View style={styles.row}>
            <Ionicons name="trophy" size={16} color={colors.textMuted} />
            <Text style={cardStyles.bodyText}>
              Hurling/Camogie · {hurlingFirst.key} · {hurlingFirst.value}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};
