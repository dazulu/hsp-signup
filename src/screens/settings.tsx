import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LanguageSwitcher } from "../components/language-switcher";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { useLocale } from "../i18n";
import { theme } from "../theme";
import { styles } from "./settings.styles";

const { space } = theme;

const SettingsScrollContent = () => {
  const { headerHeight } = useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { t } = useLocale();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: bottom + space[12] },
      ]}
      scrollIndicatorInsets={{ top: headerHeight }}
    >
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t("settings.language")}</Text>
          <LanguageSwitcher />
        </View>
      </View>
    </ScrollView>
  );
};

export const SettingsScreen = () => {
  const { t } = useLocale();

  return (
    <ScreenLayout title={t("settings.title")}>
      <SettingsScrollContent />
    </ScreenLayout>
  );
};
