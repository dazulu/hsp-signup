import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, CardGrid } from "../components/card";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { useLocale } from "../i18n";
import { theme } from "../theme";
import { styles } from "./training-info.styles";

const { colors, space } = theme;

const HSP_SPORTS_URL =
  "https://www.hochschulsport.uni-hamburg.de/sportcampus/vona-z.html";

const Bullet = ({ text, semibold }: { text: string; semibold?: boolean }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bullet}>•</Text>
    <Text style={semibold ? styles.bulletTextSemibold : styles.bulletText}>
      {text}
    </Text>
  </View>
);

const Step = ({ n, text }: { n: number; text: string }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{n}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const TrainingInfoScrollContent = () => {
  const { headerHeight } = useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { t } = useLocale();
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      };
    }, []),
  );

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: bottom + space[12] },
      ]}
      scrollIndicatorInsets={{ top: headerHeight }}
    >
      <CardGrid>
        {/* Equipment card */}
        <Card span={2} title={t("trainingInfo.equipment.title")}>
          <View style={styles.spacer} />
          <Text style={styles.sectionTitle}>
            {t("trainingInfo.equipment.hurlingTitle")}
          </Text>
          <Text style={styles.body}>
            {t("trainingInfo.equipment.hurlingBody")}
          </Text>

          <View style={styles.spacer} />
          <Text style={styles.sectionTitle}>
            {t("trainingInfo.equipment.footballTitle")}
          </Text>
          <Text style={styles.body}>
            {t("trainingInfo.equipment.footballBody")}
          </Text>

          <View style={styles.spacer} />
          <Text style={styles.sectionTitle}>
            {t("trainingInfo.equipment.generalTitle")}
          </Text>
          <Bullet text={t("trainingInfo.equipment.water")} />
          <Bullet text={t("trainingInfo.equipment.towel")} />
        </Card>

        {/* Hochschulsport facilities */}
        <Card span={2} title={t("trainingInfo.hsp.title")}>
          <View style={styles.spacer} />
          <Bullet text={t("trainingInfo.hsp.astroturf")} />
          <Bullet text={t("trainingInfo.hsp.changingRooms")} />
          <Bullet text={t("trainingInfo.hsp.waterFountain")} />
          <Bullet text={t("trainingInfo.hsp.membershipNote")} semibold />

          <View style={styles.spacer} />
          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            {t("trainingInfo.membership.title")}
          </Text>

          <View style={styles.spacer} />
          <Text style={styles.body}>{t("trainingInfo.membership.intro")}</Text>
          <Step n={1} text={t("trainingInfo.membership.step1")} />
          <Step n={2} text={t("trainingInfo.membership.step2")} />
          <Step n={3} text={t("trainingInfo.membership.step3")} />
          <Pressable
            style={({ pressed }) => [
              styles.linkItem,
              pressed && styles.linkItemPressed,
            ]}
            onPress={() => Linking.openURL(HSP_SPORTS_URL)}
            accessibilityRole="link"
          >
            <Text style={styles.linkLabel} numberOfLines={1}>
              {t("trainingInfo.membership.link")}
            </Text>
            <Ionicons name="open-outline" size={16} color={colors.textMuted} />
          </Pressable>
        </Card>

        {/* Stadtpark facilities */}
        <Card span={2} title={t("trainingInfo.stadtpark.title")}>
          <View style={styles.spacer} />
          <Text style={styles.body}>{t("trainingInfo.stadtpark.body")}</Text>
        </Card>
      </CardGrid>
    </ScrollView>
  );
};

export const TrainingInfoScreen = () => {
  const { t } = useLocale();

  return (
    <ScreenLayout
      title={t("trainingInfo.title")}
      subtitle={t("trainingInfo.subtitle")}
    >
      <TrainingInfoScrollContent />
    </ScreenLayout>
  );
};
