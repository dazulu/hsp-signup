import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../../components/card/card";
import {
  ScreenLayout,
  useScreenLayout,
} from "../../../components/screen-layout";
import { useLocale } from "../../../i18n";
import type { LearnStackParamList } from "../../../navigation/types";
import { theme } from "../../../theme";
import { LEARN_CONTENT } from "../content";
import type { LearnSport } from "../content/types";
import { LEARN_SPORTS, SPORT_NAME_KEYS } from "../content/types";
import { styles } from "./styles";

const { space } = theme;

const LearnHomeContent = () => {
  const { t } = useLocale();
  const { bottom } = useSafeAreaInsets();
  const { contentPaddingTop, onScrollHandler, resetScrollY } =
    useScreenLayout();
  const scrollRef = useRef<ScrollView>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<LearnStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      return () => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
        resetScrollY();
      };
    }, [resetScrollY]),
  );

  const handleSportPress = useCallback(
    (sport: LearnSport) => {
      navigation.navigate("SportDetail", { sport });
    },
    [navigation],
  );

  if (contentPaddingTop <= 0) {
    return null;
  }

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: contentPaddingTop, paddingBottom: bottom + space[12] },
      ]}
      onScroll={onScrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heroHeading}>{t("learn.hero.heading")}</Text>
      <Text style={styles.heroBody}>{t("learn.hero.body")}</Text>
      <View style={styles.cardsWrapper}>
        {LEARN_SPORTS.map((sport) => {
          const content = LEARN_CONTENT[sport];
          return (
            <Card
              key={sport}
              span={2}
              backgroundImage={content.hubImage}
              onPress={() => handleSportPress(sport)}
            >
              <View style={styles.cardContent}>
                <Text style={styles.sportName}>
                  {t(SPORT_NAME_KEYS[sport])}
                </Text>
                <Text style={styles.tagline}>{t(content.taglineKey)}</Text>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
};

export const LearnHomeScreen = () => {
  const { t } = useLocale();

  return (
    <ScreenLayout title={t("learn.title")} subtitle={t("learn.subtitle")}>
      <LearnHomeContent />
    </ScreenLayout>
  );
};
