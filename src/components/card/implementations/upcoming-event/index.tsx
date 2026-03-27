import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { theme } from "../../../../theme";
import { Card, cardStyles } from "../../";
import { styles } from "./styles";

const { colors } = theme;

export const UpcomingEventCard = () => {
  return (
    <Card span={2} title="Upcoming" onPress={() => {}}>
      <View style={styles.content}>
        <View style={styles.row}>
          <Ionicons name="trophy" size={16} color={colors.textMuted} />
          <Text style={cardStyles.bodyText}>
            Gaelic Football · Frankfurt · April 18th, 2026
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="trophy" size={16} color={colors.textMuted} />
          <Text style={cardStyles.bodyText}>
            Hurling/Camogie · Eindhoven · May 2nd, 2026
          </Text>
        </View>
      </View>
    </Card>
  );
};
