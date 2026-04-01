import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { theme } from "../../../../theme";
import { Card } from "../../card";
import { styles } from "./styles";
import type { NoticeCardProps } from "./types";

const { colors } = theme;

export const NoticeCard = ({ message }: NoticeCardProps) => {
  if (!message) {
    return null;
  }

  return (
    <Card variant="notice" span={2}>
      <View style={styles.row}>
        <Ionicons
          name="alert-circle"
          size={28}
          color={colors.noticeIcon}
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Card>
  );
};
