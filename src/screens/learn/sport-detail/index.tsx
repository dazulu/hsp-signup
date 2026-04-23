import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useRef, useState } from "react";
import {
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnchorNav } from "../../../components/anchor-nav";
import { Card, CardGrid } from "../../../components/card";
import { ExternalLink } from "../../../components/external-link";
import {
  ScreenLayout,
  useScreenLayout,
} from "../../../components/screen-layout";
import { useLocale } from "../../../i18n";
import type { TranslationKey } from "../../../i18n/types";
import type { LearnStackParamList } from "../../../navigation/types";
import { theme } from "../../../theme";
import { LEARN_CONTENT } from "../content";
import type { LearnSport, SectionKey } from "../content/types";
import { SECTION_KEYS, SPORT_NAME_KEYS } from "../content/types";
import { styles } from "./styles";

const { space, colors } = theme;

const ANCHOR_NAV_HEIGHT = 52;

const SportDetailContent = ({ sport }: { sport: LearnSport }) => {
  const { t } = useLocale();
  const { bottom } = useSafeAreaInsets();
  const content = LEARN_CONTENT[sport];
  const { contentPaddingTop, onScrollHandler } = useScreenLayout();
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<SectionKey, number>>({
    history: 0,
    rules: 0,
    equipment: 0,
    drills: 0,
  });
  const [activeSection, setActiveSection] = useState<SectionKey>("history");
  const activeSectionRef = useRef<SectionKey>("history");
  const isProgrammaticScrollRef = useRef(false);

  const detectActiveSection = useCallback(
    (scrollY: number) => {
      const threshold = contentPaddingTop + ANCHOR_NAV_HEIGHT + space[24];
      let newActive: SectionKey = SECTION_KEYS[0];
      for (const section of SECTION_KEYS) {
        if (sectionOffsets.current[section] <= scrollY + threshold) {
          newActive = section;
        }
      }
      if (newActive !== activeSectionRef.current) {
        activeSectionRef.current = newActive;
        setActiveSection(newActive);
      }
    },
    [contentPaddingTop],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScrollHandler(event);
      if (isProgrammaticScrollRef.current) {
        return;
      }
      detectActiveSection(event.nativeEvent.contentOffset.y);
    },
    [onScrollHandler, detectActiveSection],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isProgrammaticScrollRef.current = false;
      detectActiveSection(event.nativeEvent.contentOffset.y);
    },
    [detectActiveSection],
  );

  const handleAnchorPress = useCallback(
    (section: SectionKey) => {
      isProgrammaticScrollRef.current = true;
      activeSectionRef.current = section;
      setActiveSection(section);
      const offset = sectionOffsets.current[section];
      scrollRef.current?.scrollTo({
        y: offset - contentPaddingTop - ANCHOR_NAV_HEIGHT,
        animated: true,
      });
    },
    [contentPaddingTop],
  );

  if (contentPaddingTop <= 0) {
    return null;
  }

  const scrollPaddingTop = contentPaddingTop + ANCHOR_NAV_HEIGHT;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.anchorNavWrapper, { top: contentPaddingTop - 20 }]}>
        <AnchorNav
          sections={SECTION_KEYS}
          activeSection={activeSection}
          onPress={handleAnchorPress}
        />
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: scrollPaddingTop,
            paddingBottom: bottom + space[12],
          },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {/* History section */}
        <View
          onLayout={(event) => {
            sectionOffsets.current.history = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionHeading}>
            {t("learn.section.history")}
          </Text>
          <View style={styles.statsRow}>
            {content.history.stats.map((stat) => (
              <View key={stat.labelKey} style={styles.statTile}>
                <Ionicons
                  name={
                    stat.icon as React.ComponentProps<typeof Ionicons>["name"]
                  }
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.statValue}>{t(stat.valueKey)}</Text>
                <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
              </View>
            ))}
          </View>
          <Card>
            <Text style={styles.bodyText}>{t(content.history.introKey)}</Text>
            <Text style={styles.bodyText}>{t(content.history.bodyKey)}</Text>
          </Card>
        </View>

        <View style={styles.sectionDivider} />

        {/* Rules section */}
        <View
          onLayout={(event) => {
            sectionOffsets.current.rules = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionHeading}>{t("learn.section.rules")}</Text>
          <Card>
            <Text style={styles.scoringText}>
              {t(content.rules.scoringKey)}
            </Text>
          </Card>
          <View style={styles.sectionDivider} />
          <Card>
            {content.rules.ruleKeys.map((ruleKey: TranslationKey) => (
              <View key={ruleKey} style={styles.ruleRow}>
                <Text style={styles.ruleBullet}>{"\u2022"}</Text>
                <Text style={styles.ruleText}>{t(ruleKey)}</Text>
              </View>
            ))}
            <ExternalLink
              label={t("learn.rules.officialLink")}
              href={content.rules.rulesUrl}
              style={styles.rulesLink}
            />
          </Card>
        </View>

        <View style={styles.sectionDivider} />

        {/* Equipment section */}
        <View
          onLayout={(event) => {
            sectionOffsets.current.equipment = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionHeading}>
            {t("learn.section.equipment")}
          </Text>
          <CardGrid gap={12}>
            {content.equipment.map((item) => (
              <Card key={item.nameKey} span={2}>
                <View style={styles.equipmentItem}>
                  <Image
                    source={{ uri: item.placeholderUrl }}
                    style={styles.equipmentImage}
                    accessibilityLabel={t(item.nameKey)}
                  />
                  <View style={styles.equipmentInfo}>
                    <Text style={styles.equipmentName}>{t(item.nameKey)}</Text>
                    <Text style={styles.equipmentDescription}>
                      {t(item.descriptionKey)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </CardGrid>
        </View>

        <View style={styles.sectionDivider} />

        {/* Drills section */}
        <View
          onLayout={(event) => {
            sectionOffsets.current.drills = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionHeading}>{t("learn.section.drills")}</Text>
          <CardGrid gap={12}>
            {content.drills.map((drill) => (
              <Card key={drill.titleKey} span={2}>
                <Text style={styles.drillTitle}>{t(drill.titleKey)}</Text>
                <Text style={styles.drillDescription}>
                  {t(drill.descriptionKey)}
                </Text>
                {drill.steps.map((step, stepIndex) => (
                  <View key={step.stepKey} style={styles.stepRow}>
                    <Text style={styles.stepNumber}>{stepIndex + 1}.</Text>
                    <Text style={styles.stepText}>{t(step.stepKey)}</Text>
                  </View>
                ))}
              </Card>
            ))}
          </CardGrid>
        </View>
      </ScrollView>
    </View>
  );
};

export const SportDetailScreen = () => {
  const { t } = useLocale();
  const route = useRoute<RouteProp<LearnStackParamList, "SportDetail">>();
  const navigation =
    useNavigation<NativeStackNavigationProp<LearnStackParamList>>();
  const { sport } = route.params;

  const content = LEARN_CONTENT[sport];

  return (
    <ScreenLayout
      title={t(SPORT_NAME_KEYS[sport])}
      subtitle={t(content.taglineKey)}
      onBack={() => navigation.goBack()}
    >
      <SportDetailContent sport={sport} />
    </ScreenLayout>
  );
};
