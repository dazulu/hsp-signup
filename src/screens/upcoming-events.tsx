import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, CardGrid } from "../components/card";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { useMobileAppData } from "../context/mobile-app-data";
import { useLocale } from "../i18n";
import type { ClubStackParamList } from "../navigation/types";
import type { ContentfulItem } from "../services/contentful/types";
import { theme } from "../theme";
import { formatEventDate } from "../utils";
import { styles } from "./upcoming-events.styles";

const { space } = theme;

type SportEvent = { location: string; date: string };

const toEvents = (items: ContentfulItem[]): SportEvent[] =>
  items.map((item) => ({ location: item.key, date: item.value }));

const UpcomingEventsContent = () => {
  const { contentPaddingTop, onScrollHandler } = useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { t, locale } = useLocale();
  const { events, refreshContentful } = useMobileAppData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    refreshContentful().finally(() => setIsRefreshing(false));
  }, [refreshContentful]);

  const hurlingEvents = events ? toEvents(events.hurling) : [];
  const footballEvents = events ? toEvents(events.football) : [];

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: contentPaddingTop, paddingBottom: bottom + space[12] },
      ]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      onScroll={onScrollHandler}
      scrollEventThrottle={16}
    >
      <CardGrid>
        <Card span={2} title={t("upcoming.hurling")}>
          <View style={styles.cardContent}>
            {hurlingEvents.map((event, i) => (
              <View key={event.location}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.eventRow}>
                  <Text style={styles.location}>{event.location}</Text>
                  <Text style={styles.date}>
                    {formatEventDate(event.date, locale)}
                  </Text>
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
                  <Text style={styles.date}>
                    {formatEventDate(event.date, locale)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </CardGrid>
    </ScrollView>
  );
};

export const UpcomingEventsScreen = () => {
  const { t } = useLocale();
  const navigation =
    useNavigation<NativeStackNavigationProp<ClubStackParamList>>();

  return (
    <ScreenLayout
      title={t("upcoming.title")}
      subtitle={t("upcoming.subtitle")}
      onBack={() => navigation.goBack()}
    >
      <UpcomingEventsContent />
    </ScreenLayout>
  );
};
