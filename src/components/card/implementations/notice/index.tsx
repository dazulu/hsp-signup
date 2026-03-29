import { Text } from "react-native";
import { useMobileAppData } from "../../../../context/mobile-app-data";
import { Card } from "../../card";
import { styles } from "./styles";

export const NoticeCard = () => {
  const { data } = useMobileAppData();
  const message = data?.notice;

  if (!message) {
    return null;
  }

  return (
    <Card variant="notice" span={2}>
      <Text style={styles.message}>{message}</Text>
    </Card>
  );
};
