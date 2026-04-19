import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useRef } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, CardGrid } from "../components/card";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { useTrainingQuote } from "../hooks/use-training-quote";
import { useLocale } from "../i18n";
import type { TrainingStackParamList } from "../navigation/types";
import { theme } from "../theme";
import { styles } from "./training-info.styles";

const { space } = theme;

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
  const { headerHeight, contentPaddingTop, onScrollHandler, resetScrollY } =
    useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { t, locale } = useLocale();
  const scrollRef = useRef<ScrollView>(null);
  const trainingQuote = useTrainingQuote();

  useFocusEffect(
    useCallback(() => {
      return () => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
        resetScrollY();
      };
    }, [resetScrollY]),
  );

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: contentPaddingTop, paddingBottom: bottom + space[12] },
      ]}
      scrollIndicatorInsets={{ top: headerHeight }}
      onScroll={onScrollHandler}
      scrollEventThrottle={16}
    >
      <CardGrid>
        <Card span={2} title={t("trainingInfo.equipment.title")}>
          <View style={styles.spacer} />
          <Text style={styles.sectionTitle}>
            {t("trainingInfo.equipment.generalTitle")}
          </Text>
          <Bullet text={t("trainingInfo.equipment.water")} />
          <Bullet text={t("trainingInfo.equipment.towel")} />

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
          <Bullet text={t("trainingInfo.equipment.footballBody")} semibold />
        </Card>

        {trainingQuote !== null ? (
          <Card span={2} transparent>
            <Text style={styles.quoteText}>
              {locale === "de" ? "\u201E" : "\u201C"}
              {trainingQuote.quoteText}
              {locale === "de" ? "\u201C" : "\u201D"}
            </Text>
            {trainingQuote.person !== undefined ? (
              <View style={styles.quotePersonRow}>
                {trainingQuote.person.imageUrl !== "" ? (
                  <Image
                    source={{ uri: trainingQuote.person.imageUrl }}
                    style={styles.quoteAvatar}
                  />
                ) : null}
                <Text style={styles.quoteAttribution}>
                  {trainingQuote.person.name}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        <Card span={2} title={t("trainingInfo.membership.title")}>
          <View style={styles.spacer} />
          <Text style={styles.body}>{t("trainingInfo.membership.intro")}</Text>
          <Step n={1} text={t("trainingInfo.membership.step1")} />
          <Step n={2} text={t("trainingInfo.membership.step2")} />
          <Step n={3} text={t("trainingInfo.membership.step3")} />
          <Pressable
            style={({ pressed }) => [
              styles.linkItemPrimary,
              pressed && styles.linkItemPressed,
            ]}
            onPress={() => Linking.openURL(HSP_SPORTS_URL)}
            accessibilityRole="link"
          >
            <Text style={styles.linkLabelPrimary} numberOfLines={1}>
              {t("trainingInfo.membership.link")}
            </Text>
            <Ionicons name="open-outline" size={16} color="white" />
          </Pressable>
        </Card>

        <Card span={2} title={t("trainingInfo.hsp.title")}>
          <View style={styles.spacer} />
          <Bullet text={t("trainingInfo.hsp.astroturf")} />
          <Bullet text={t("trainingInfo.hsp.changingRooms")} />
          <Bullet text={t("trainingInfo.hsp.waterFountain")} />
        </Card>

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
  const navigation =
    useNavigation<NativeStackNavigationProp<TrainingStackParamList>>();

  return (
    <ScreenLayout
      title={t("trainingInfo.title")}
      subtitle={t("trainingInfo.subtitle")}
      onBack={() => navigation.goBack()}
    >
      <TrainingInfoScrollContent />
    </ScreenLayout>
  );
};
