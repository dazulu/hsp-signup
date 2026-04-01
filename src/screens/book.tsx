import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import type { ScrollView } from "react-native";
import { BookingForm } from "../components/booking";
import { ScreenLayout } from "../components/screen-layout";
import { useMobileAppData } from "../context/mobile-app-data";
import { useLocale } from "../i18n";

export const BookScreen = () => {
  const { t } = useLocale();
  const { refreshContentful } = useMobileAppData();
  const scrollRef = useRef<ScrollView>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshContentful();
      return () => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      };
    }, [refreshContentful]),
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    refreshContentful().finally(() => setIsRefreshing(false));
  }, [refreshContentful]);

  return (
    <ScreenLayout title={t("book.title")} subtitle={t("book.subtitle")}>
      <BookingForm
        scrollRef={scrollRef}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
      />
    </ScreenLayout>
  );
};
