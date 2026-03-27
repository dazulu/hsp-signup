import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { SPORTS } from "../../../../hooks/use-booking";
import { formatTimeAgo } from "../../../../utils";
import { Card, cardStyles } from "../../";
import { styles } from "./styles";
import type { LastBooking } from "./types";

type TabParamList = { Club: undefined; Book: undefined; Photos: undefined };

export const LastBookingCard = () => {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [lastBooking, setLastBooking] = useState<LastBooking | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("hsp_last_booking").then((raw) => {
      if (raw) {
        try {
          setLastBooking(JSON.parse(raw));
        } catch {}
      }
    });
  }, []);

  const sportLabel = lastBooking
    ? SPORTS.find((s) => s.key === lastBooking.sport)?.label
    : null;

  return (
    <Card
      span={2}
      title="Last HSP Booking"
      onPress={() => navigation.navigate("Book")}
    >
      <Text style={[cardStyles.bodyText, styles.bookingText]}>
        {lastBooking && sportLabel
          ? `${sportLabel} · ${formatTimeAgo(lastBooking.bookedAt)}`
          : "-"}
      </Text>
    </Card>
  );
};
