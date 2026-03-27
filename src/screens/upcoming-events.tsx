import { ScrollView, Text, View } from "react-native";
import { Card, CardGrid } from "../components/card";
import { ScreenLayout } from "../components/screen-layout";
import { styles } from "./upcoming-events.styles";

type SportEvent = { location: string; date: string };

const HURLING_EVENTS: SportEvent[] = [
  { location: "Eindhoven", date: "May 2nd" },
  { location: "Copenhagen", date: "June 6th" },
  { location: "Vienna", date: "September 5th" },
  { location: "Amsterdam", date: "October 3rd" },
];

const FOOTBALL_EVENTS: SportEvent[] = [
  { location: "Frankfurt", date: "April 18th" },
  { location: "Luxembourg", date: "May 30th" },
  { location: "Eindhoven", date: "September 26th" },
  { location: "Lyon (Pan Euros)", date: "October 17th" },
  { location: "German Cup", date: "Place & Date tbc" },
];

export const UpcomingEventsScreen = () => {
  return (
    <ScreenLayout
      title="Upcoming"
      subtitle="The next events in our calendar that you won't want to miss."
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <CardGrid>
          <Card span={2} title="Hurling / Camogie">
            <View style={styles.cardContent}>
              {HURLING_EVENTS.map((event, i) => (
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
          <Card span={2} title="Gaelic Football">
            <View style={styles.cardContent}>
              {FOOTBALL_EVENTS.map((event, i) => (
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
