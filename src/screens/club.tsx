import { ScrollView, StyleSheet } from "react-native";
import { CardGrid } from "../components/card";
import { ClubLinksCard } from "../components/card/implementations/club-links";
import { LastBookingCard } from "../components/card/implementations/last-booking";
import { StravaCards } from "../components/card/implementations/strava-cards";
import { UpcomingEventCard } from "../components/card/implementations/upcoming-event";
import { ScreenLayout } from "../components/screen-layout";
import { useWelcomeText } from "../hooks/use-welcome-text";
import { theme } from "../theme";

const { space } = theme;

export const ClubScreen = () => {
  const { title, subtitle } = useWelcomeText();

  return (
    <ScreenLayout title={title} subtitle={subtitle}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <CardGrid>
          <UpcomingEventCard />
          <StravaCards />
          <LastBookingCard />
          <ClubLinksCard />
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
