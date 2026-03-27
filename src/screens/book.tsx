import { BookingForm } from "../components/booking";
import { ScreenLayout } from "../components/screen-layout";

export default function BookScreen() {
  return (
    <ScreenLayout
      title="Book"
      subtitle="Automatically book the next available Hamburg GAA training session at Hochschulsport."
    >
      <BookingForm />
    </ScreenLayout>
  );
}
