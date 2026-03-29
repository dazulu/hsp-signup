import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { BookingForm } from "../components/booking";
import { ScreenLayout } from "../components/screen-layout";
import { useMobileAppData } from "../context/mobile-app-data";
import { useLocale } from "../i18n";

export const BookScreen = () => {
  const { t } = useLocale();
  const { refresh } = useMobileAppData();

  useFocusEffect(useCallback(refresh, [refresh]));

  return (
    <ScreenLayout title={t("book.title")} subtitle={t("book.subtitle")}>
      <BookingForm />
    </ScreenLayout>
  );
};
