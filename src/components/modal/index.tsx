import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";
import { theme } from "../../theme";
import { ExternalLink } from "../external-link";
import { styles } from "./styles";
import type { TooltipModalProps } from "./types";

const { colors } = theme;

const FADE_DURATION = 200;

export const TooltipModal = ({
  text,
  linkUrl,
  linkText,
}: TooltipModalProps) => {
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  const open = () => {
    opacity.setValue(0);
    setVisible(true);
  };

  const close = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setVisible(false);
      }
    });
  };

  const onShow = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="More information"
        hitSlop={8}
      >
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={colors.textMuted}
        />
      </Pressable>
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onShow={onShow}
        onRequestClose={close}
      >
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <Pressable
            style={styles.backdropDismiss}
            onPress={close}
            accessible={false}
          />
          <View style={styles.box}>
            <Text style={styles.content}>{text}</Text>
            {linkUrl && linkText ? (
              <ExternalLink
                href={linkUrl}
                label={linkText}
                style={styles.link}
              />
            ) : null}
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};
