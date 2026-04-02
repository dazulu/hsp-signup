import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Card, CardGrid } from "../components/card";
import { ScreenLayout } from "../components/screen-layout";
import { useMobileAppData } from "../context/mobile-app-data";
import { useLocale } from "../i18n";
import type { TabParamList } from "../navigation/types";
import type { ContentfulItem } from "../services/contentful/types";
import { styles } from "./upcoming-events.styles";

type SportEvent = { location: string; date: string };

const toEvents = (items: ContentfulItem[]): SportEvent[] =>
  items.map((item) => ({ location: item.key, date: item.value }));

export const UpcomingEventsScreen = () => {
  const { t } = useLocale();
  const { events, refreshContentful } = useMobileAppData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    refreshContentful().finally(() => setIsRefreshing(false));
  }, [refreshContentful]);

  const hurlingEvents = events ? toEvents(events.hurling) : [];
  const footballEvents = events ? toEvents(events.football) : [];

  return (
    <ScreenLayout
      title={t("upcoming.title")}
      subtitle={t("upcoming.subtitle")}
      onBack={() => navigation.navigate("Club")}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <CardGrid>
          <Card span={2} title={t("upcoming.hurling")}>
            <View style={styles.cardContent}>
              {hurlingEvents.map((event, i) => (
                <View key={event.location}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.eventRow}>
                    <Text style={styles.location}>{event.location}</Text>
                    <Text style={styles.date}>{event.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
          <Card span={2} title={t("upcoming.football")}>
            <View style={styles.cardContent}>
              {footballEvents.map((event, i) => (
                <View key={event.location}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.eventRow}>
                    <Text style={styles.location}>{event.location}</Text>
                    <Text style={styles.date}>{event.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </CardGrid>
      </ScrollView>
    </ScreenLayout>
  );
};
