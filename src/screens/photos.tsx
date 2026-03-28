import { StyleSheet, Text, View } from "react-native";
import { ScreenLayout } from "../components/screen-layout";
import { useLocale } from "../i18n";

export const PhotosScreen = () => {
  const { t } = useLocale();

  return (
    <ScreenLayout title={t("photos.title")}>
      <View style={styles.content}>
        <Text style={styles.placeholder}>{t("photos.comingSoon")}</Text>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    color: "#7080aa",
    fontFamily: "jakarta-400",
    fontSize: 16,
  },
});
