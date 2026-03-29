import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Card, CardGrid } from "../components/card";
import { ScreenLayout } from "../components/screen-layout";
import { useLocale } from "../i18n";
import type { TabParamList } from "../navigation/types";
import { type EventsData, fetchEvents } from "../services/contentful";
import type { ContentfulItem } from "../services/contentful/types";
import { styles } from "./upcoming-events.styles";

type SportEvent = { location: string; date: string };

const toEvents = (items: ContentfulItem[]): SportEvent[] =>
  items.map((item) => ({ location: item.key, date: item.value }));

type Props = BottomTabScreenProps<TabParamList, "UpcomingEvents">;

export const UpcomingEventsScreen = ({ route }: Props) => {
  const { t } = useLocale();
  const passed = route.params?.events;
  const [data, setData] = useState<EventsData | null>(passed ?? null);

  useEffect(() => {
    if (!passed) {
      fetchEvents().then(setData);
    }
  }, [passed]);

  const hurlingEvents = data ? toEvents(data.hurling) : [];
  const footballEvents = data ? toEvents(data.football) : [];

  return (
    <ScreenLayout title={t("upcoming.title")} subtitle={t("upcoming.subtitle")}>
      <ScrollView contentContainerStyle={styles.scroll}>
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
