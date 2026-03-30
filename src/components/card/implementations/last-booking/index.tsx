import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
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
  const { label, isStale } = useLastBookingLabel();
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  return (
    <Card
      span={2}
      title={t("card.lastBooking.title")}
      onPress={() => navigation.navigate("Book")}
    >
      <View style={styles.row}>
        {label ? (
          <>
            <Text style={styles.tick}>{"\u2713"}</Text>
            <Text style={[cardStyles.bodyText]}>{label}</Text>
          </>
        ) : (
          <Text style={[cardStyles.bodyText]}>
            {t("card.lastBooking.empty")}
          </Text>
        )}
      </View>
      {isStale && !nudgeDismissed && (
        <Pressable
          style={styles.nudgePill}
          onPress={(e) => {
            e.stopPropagation();
            setNudgeDismissed(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        >
          <Text style={styles.nudgeText}>
            {t("card.lastBooking.staleNudge")}
          </Text>
          <Ionicons name="close" size={14} color={colors.warningText} />
        </Pressable>
      )}
    </Card>
  );
};
