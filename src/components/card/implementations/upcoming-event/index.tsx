import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { theme } from "../../../../theme";
import { Card, cardStyles } from "../../";
import { styles } from "./styles";

const { colors } = theme;

export const UpcomingEventCard = () => {
  return (
    <Card span={2} title="Upcoming Event" transparent onPress={() => {}}>
      <View style={styles.row}>
        <Ionicons name="trophy" size={16} color={colors.textMuted} />
        <Text style={cardStyles.bodyText}>
          Gaelic Football · Maastrict · March 21st
        </Text>
      </View>
    </Card>
  );
};
