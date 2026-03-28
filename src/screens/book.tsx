import { BookingForm } from "../components/booking";
import { ScreenLayout } from "../components/screen-layout";
import { useLocale } from "../i18n";

export const BookScreen = () => {
  const { t } = useLocale();

  return (
    <ScreenLayout title={t("book.title")} subtitle={t("book.subtitle")}>
      <BookingForm />
    </ScreenLayout>
  );
};
