import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Text } from "react-native";
import { useLastBookingLabel } from "../../../../hooks/use-last-booking-label";
import { Card, cardStyles } from "../../";
import { styles } from "./styles";

type TabParamList = { Club: undefined; Book: undefined; Photos: undefined };

export const LastBookingCard = () => {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const label = useLastBookingLabel();

  return (
    <Card
      span={2}
      title="Last HSP Booking"
      onPress={() => navigation.navigate("Book")}
    >
      <Text style={[cardStyles.bodyText, styles.bookingText]}>
        {label ?? "-"}
      </Text>
    </Card>
  );
};
