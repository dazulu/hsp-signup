import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useLocale } from "../../i18n";
import { LOCALE_LABELS, LOCALES } from "../../i18n/types";
import { theme } from "../../theme";
import { styles } from "./styles";

const { colors } = theme;

export const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useLocale();
  const [visible, setVisible] = useState(false);

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
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            {LOCALES.map((l) => (
              <Pressable
                key={l}
                style={styles.option}
                onPress={() => {
                  setLocale(l);
                  setVisible(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: l === locale }}
              >
                <Text
                  style={[
                    styles.optionText,
                    l === locale && styles.optionTextActive,
                  ]}
                >
                  {LOCALE_LABELS[l]}
                </Text>
                {l === locale && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
