import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CardGrid } from "../components/card";
import { ClubLinksCard } from "../components/card/implementations/club-links";
import { LastBookingCard } from "../components/card/implementations/last-booking";
import { NoticeCard } from "../components/card/implementations/notice";
import { StravaCards } from "../components/card/implementations/strava-cards";
import { UpcomingEventCard } from "../components/card/implementations/upcoming-event";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { useMobileAppData } from "../context/mobile-app-data";
import { useWelcomeText } from "../hooks/use-welcome-text";
import { theme } from "../theme";

const { space } = theme;

const ClubScrollContent = () => {
  const { headerHeight, contentPaddingTop, onScrollHandler, resetScrollY } =
    useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { data, refresh, refreshContentful } = useMobileAppData();
  const scrollRef = useRef<ScrollView>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshContentful();
      return () => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
        resetScrollY();
      };
    }, [refreshContentful, resetScrollY]),
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    refresh(true).finally(() => setIsRefreshing(false));
  }, [refresh]);

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[
        styles.scroll,
        {
          paddingTop: contentPaddingTop,
          paddingBottom: bottom + space[12],
        },
      ]}
      scrollIndicatorInsets={{ top: headerHeight }}
      onScroll={onScrollHandler}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <CardGrid>
        <NoticeCard message={data?.notice ?? undefined} />
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
    paddingTop: space[16],
  },
});
