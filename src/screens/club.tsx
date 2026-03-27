import { ScrollView, StyleSheet, Text } from "react-native";
import { Card, CardGrid } from "../components/card";
import { LastBookingCard } from "../components/card/implementations/last-booking";
import { ScreenLayout } from "../components/screen-layout";
import { theme } from "../theme";

const { space } = theme;

export const ClubScreen = () => {
  return (
    <ScreenLayout title="Club">
      <ScrollView contentContainerStyle={styles.scroll}>
        <CardGrid>
          <Card span={2} title="Upcoming" transparent>
            <Text>content </Text>
          </Card>
          <Card span={1} title="Placeholder" />
          <Card span={1} title="Placeholder" />
          <LastBookingCard />
        </CardGrid>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: space[16],
    paddingBottom: space[32],
  },
});
