import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Text, View } from "react-native";
import { useLastBookingLabel } from "../../../../hooks/use-last-booking-label";
import { useLocale } from "../../../../i18n";
import { theme } from "../../../../theme";
import { Card, cardStyles } from "../../";
import { styles } from "./styles";

const { colors } = theme;

type TabParamList = { Club: undefined; Book: undefined; Photos: undefined };

export const LastBookingCard = () => {
  const { t } = useLocale();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const label = useLastBookingLabel();

  return (
    <Card
      span={2}
      title={t("card.lastBooking.title")}
      onPress={() => navigation.navigate("Book")}
    >
      <View style={styles.row}>
        <Ionicons name="time-outline" size={16} color={colors.textMuted} />
        <Text style={[cardStyles.bodyText]}>{label ?? "-"}</Text>
      </View>
    </Card>
  );
};
