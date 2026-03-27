import { ScrollView, StyleSheet, Text } from "react-native";
import { Card, CardGrid } from "../components/card";
import { ScreenLayout } from "../components/screen-layout";

export default function ClubScreen() {
  return (
    <ScreenLayout title="Club">
      <ScrollView contentContainerStyle={styles.scroll}>
        <CardGrid>
          <Card span={2} title="Upcoming" transparent>
            <Text>content </Text>
          </Card>
          <Card span={1} title="Placeholder" />
          <Card span={1} title="Placeholder" />
          <Card span={2} title="Last Booking" />
        </CardGrid>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
});
