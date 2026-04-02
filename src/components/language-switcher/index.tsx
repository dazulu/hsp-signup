import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, Text } from "react-native";
import { useLocale } from "../../i18n";
import { LOCALE_LABELS, LOCALES } from "../../i18n/types";
import { theme } from "../../theme";
import { styles } from "./styles";

const { colors } = theme;

const SLIDE_DURATION = 250;

export const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useLocale();
  const [visible, setVisible] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(anim, {
        toValue: 1,
        duration: SLIDE_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, anim]);

  const close = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  return (
    <>
      <Pressable
        style={styles.trigger}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t("settings.language")}
      >
        <Text style={styles.triggerText}>{LOCALE_LABELS[locale]}</Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={colors.textMuted}
          style={styles.chevron}
        />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={close}
      >
        <Animated.View style={[styles.backdrop, { opacity: anim }]}>
          <Pressable style={styles.backdropFill} onPress={close}>
            <Animated.View
              style={[
                styles.sheet,
                {
                  transform: [
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                    },
                  ],
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              {LOCALES.map((localeCode) => (
                <Pressable
                  key={localeCode}
                  style={styles.option}
                  onPress={() => {
                    setLocale(localeCode);
                    close();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: localeCode === locale }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      localeCode === locale && styles.optionTextActive,
                    ]}
                  >
                    {LOCALE_LABELS[localeCode]}
                  </Text>
                  {l === locale && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              ))}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
};
