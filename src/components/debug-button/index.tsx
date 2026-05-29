import Constants from "expo-constants";
import { Text, View } from "react-native";
import { useCopyDebugInfo } from "../../hooks/use-copy-debug-info";
import { useLocale } from "../../i18n";
import { Card } from "../card";
import { styles } from "./styles";

const appVersion = Constants.expoConfig?.version ?? "—";

export const DebugButton = () => {
  const { t } = useLocale();
  const copyDebugInfo = useCopyDebugInfo();

  return (
    <Card onLongPress={copyDebugInfo} delayLongPress={500}>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{t("settings.version")}</Text>
        <Text style={styles.rowValue}>{appVersion}</Text>
      </View>
    </Card>
  );
};
