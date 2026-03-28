import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CardGrid } from "../components/card";
import { ClubLinksCard } from "../components/card/implementations/club-links";
import { LastBookingCard } from "../components/card/implementations/last-booking";
import { StravaCards } from "../components/card/implementations/strava-cards";
import { UpcomingEventCard } from "../components/card/implementations/upcoming-event";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { useWelcomeText } from "../hooks/use-welcome-text";
import { theme } from "../theme";

const { space } = theme;

const ClubScrollContent = () => {
  const { headerHeight } = useScreenLayout();
  const { bottom } = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        {
          paddingBottom: bottom + space[12],
        },
      ]}
      scrollIndicatorInsets={{ top: headerHeight }}
    >
      <CardGrid>
        <UpcomingEventCard />
        <StravaCards />
        <LastBookingCard />
        <ClubLinksCard />
      </CardGrid>
    </ScrollView>
  );
};

export const ClubScreen = () => {
  const { title, subtitle } = useWelcomeText();

  return (
    <ScreenLayout title={title} subtitle={subtitle}>
      <ClubScrollContent />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: space[16],
    paddingTop: space[16] + 20,
  },
});
