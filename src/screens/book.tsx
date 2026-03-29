import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import type { ScrollView } from "react-native";
import { BookingForm } from "../components/booking";
import { ScreenLayout } from "../components/screen-layout";
import { useMobileAppData } from "../context/mobile-app-data";
import { useLocale } from "../i18n";

export const BookScreen = () => {
  const { t } = useLocale();
  const { refresh } = useMobileAppData();
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
      return () => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      };
    }, [refresh]),
  );

  return (
    <ScreenLayout title={t("book.title")} subtitle={t("book.subtitle")}>
      <BookingForm scrollRef={scrollRef} />
    </ScreenLayout>
  );
};
