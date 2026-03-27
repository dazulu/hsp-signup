import { BookingForm } from "../components/booking";
import { ScreenLayout } from "../components/screen-layout";

export const BookScreen = () => {
  return (
    <ScreenLayout
      title="Book"
      subtitle="Automatically book the next available Hamburg GAA training session at Hochschulsport."
    >
      <BookingForm />
    </ScreenLayout>
  );
};
