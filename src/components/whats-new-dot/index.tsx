import { useEffect, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { styles } from "./styles";

export const WhatsNewDot = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.55);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        setReduceMotion(enabled);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      ringScale.value = 1;
      ringOpacity.value = 0;
      return;
    }

    const PULSE_DURATION = 1400;
    const PAUSE_DURATION = 800;

    ringScale.value = withRepeat(
      withSequence(
        withTiming(2.6, {
          duration: PULSE_DURATION,
          easing: Easing.out(Easing.ease),
        }),
        withDelay(PAUSE_DURATION, withTiming(1, { duration: 0 })),
      ),
      -1,
      false,
    );

    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0, {
          duration: PULSE_DURATION,
          easing: Easing.out(Easing.ease),
        }),
        withDelay(PAUSE_DURATION, withTiming(0.55, { duration: 0 })),
      ),
      -1,
      false,
    );
  }, [reduceMotion, ringScale, ringOpacity]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ring, animatedRingStyle]} />
      <View style={styles.dot} />
    </View>
  );
};
