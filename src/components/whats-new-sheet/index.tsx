import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useWhatsNewSheet } from "../../context/whats-new-sheet";
import { useLocale } from "../../i18n";
import { theme } from "../../theme";
import { WHATS_NEW_ITEMS } from "../../whats-new/content";
import { styles } from "./styles";
import type { WhatsNewSheetProps } from "./types";

const { colors } = theme;

const SLIDE_DURATION = 250;

export const WhatsNewSheet = ({
  visible,
  onClose,
  navigationRef,
}: WhatsNewSheetProps) => {
  const { t } = useLocale();
  const { markSeen } = useWhatsNewSheet();
  const items = WHATS_NEW_ITEMS;
  const anim = useRef(new Animated.Value(0)).current;
  const prevVisible = useRef(false);

  useEffect(() => {
    if (visible) {
      Animated.timing(anim, {
        toValue: 1,
        duration: SLIDE_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, anim]);

  // markSeen fires exactly once: when visible transitions false → true.
  useEffect(() => {
    if (visible && !prevVisible.current) {
      markSeen();
    }
    prevVisible.current = visible;
  }, [visible, markSeen]);

  const close = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={close}
    >
      <Animated.View style={[styles.backdrop, { opacity: anim }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={close} />
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
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t("whatsNew.title")}</Text>
            <Pressable
              style={styles.closeButton}
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel={t("whatsNew.close")}
            >
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <View
                key={item.id}
                style={[styles.item, item.isNew ? styles.itemNew : null]}
              >
                <Text style={styles.itemTitle}>{t(item.titleKey)}</Text>
                <Text style={styles.itemBody}>{t(item.bodyKey)}</Text>
                {item.cta ? (
                  <Pressable
                    style={styles.ctaButton}
                    onPress={() => {
                      navigationRef.current?.navigate(
                        item.cta!.target as never,
                      );
                      close();
                    }}
                    accessibilityRole="button"
                  >
                    <Text style={styles.ctaLabel}>{t(item.cta.labelKey)}</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
