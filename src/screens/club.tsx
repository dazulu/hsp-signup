import { ScrollView, StyleSheet } from "react-native";
import { CardGrid } from "../components/card";
import { LastBookingCard } from "../components/card/implementations/last-booking";
import { StravaCards } from "../components/card/implementations/strava-cards";
import { UpcomingEventCard } from "../components/card/implementations/upcoming-event";
import { ScreenLayout } from "../components/screen-layout";
import { theme } from "../theme";

const { space } = theme;

export const ClubScreen = () => {
  return (
    <ScreenLayout title="Club">
      <ScrollView contentContainerStyle={styles.scroll}>
        <CardGrid>
          <UpcomingEventCard />
          <StravaCards />
          <LastBookingCard />
        </CardGrid>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginTop: space[40],
    padding: space[16],
    paddingBottom: space[32],
  },
});
