import { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useLocale } from "../../i18n";
import type { TranslationKey } from "../../i18n/types";
import { theme } from "../../theme";
import { styles } from "./styles";
import type { AnchorNavProps, SectionKey } from "./types";

const { colors } = theme;

const SECTION_LABEL_KEYS: Record<SectionKey, TranslationKey> = {
  history: "learn.section.history",
  rules: "learn.section.rules",
  equipment: "learn.section.equipment",
  drills: "learn.section.drills",
};

export const AnchorNav = ({
  sections,
  activeSection,
  onPress,
}: AnchorNavProps) => {
  const { t } = useLocale();
  const pillLayouts = useRef<
    Partial<Record<SectionKey, { x: number; width: number }>>
  >({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const hasInitialized = useRef(false);
  const activeSectionRef = useRef(activeSection);

  const labelProgress = useRef(
    Object.fromEntries(
      sections.map((key) => [key, new Animated.Value(0)]),
    ) as Record<SectionKey, Animated.Value>,
  ).current;

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const animateIndicator = useCallback(
    (section: SectionKey) => {
      const layout = pillLayouts.current[section];
      if (!layout) {
        return;
      }
      if (!hasInitialized.current) {
        indicatorX.setValue(layout.x);
        indicatorWidth.setValue(layout.width);
        hasInitialized.current = true;
        return;
      }
      Animated.parallel([
        Animated.spring(indicatorX, {
          toValue: layout.x,
          useNativeDriver: false,
          tension: 300,
          friction: 30,
        }),
        Animated.spring(indicatorWidth, {
          toValue: layout.width,
          useNativeDriver: false,
          tension: 300,
          friction: 30,
        }),
      ]).start();
    },
    [indicatorX, indicatorWidth],
  );

  useEffect(() => {
    if (activeSection) {
      animateIndicator(activeSection);
    }
    const animations = sections.map((key) =>
      Animated.timing(labelProgress[key], {
        toValue: key === activeSection ? 1 : 0,
        duration: 160,
        useNativeDriver: false,
      }),
    );
    Animated.parallel(animations).start();
  }, [activeSection, animateIndicator, labelProgress, sections]);

  const handlePillLayout = useCallback(
    (section: SectionKey) => (event: LayoutChangeEvent) => {
      pillLayouts.current[section] = {
        x: event.nativeEvent.layout.x,
        width: event.nativeEvent.layout.width,
      };
      if (section === activeSectionRef.current) {
        animateIndicator(section);
      }
    },
    [animateIndicator],
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Animated.View
          style={[
            styles.indicator,
            { left: indicatorX, width: indicatorWidth },
          ]}
        />
        {sections.map((section) => {
          const isActive = section === activeSection;
          const labelColor = labelProgress[section].interpolate({
            inputRange: [0, 1],
            outputRange: [colors.textMuted, colors.textOnPrimary],
          });
          return (
            <Pressable
              key={section}
              style={styles.pill}
              onLayout={handlePillLayout(section)}
              onPress={() => onPress(section)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Animated.Text style={[styles.label, { color: labelColor }]}>
                {t(SECTION_LABEL_KEYS[section])}
              </Animated.Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
