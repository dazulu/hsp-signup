import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../theme";
import { styles } from "./styles";
import type { LikeButtonProps } from "./types";

const { colors } = theme;

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

export const LikeButton = ({ entry, onToggle }: LikeButtonProps) => {
  const [optimisticEntry, setOptimisticEntry] = useState<{
    liked: boolean;
    count: number;
  } | null>(null);

  const heartScale = useSharedValue(1);

  // Optimistic entry stays active while the parent state hasn't caught up yet
  // (entry.liked still differs from the value we flipped to). Once the parent
  // reflects the toggle, we switch back to entry which has the server-reconciled count.
  const isOptimisticActive =
    optimisticEntry !== null &&
    optimisticEntry.liked !== (entry?.liked ?? false);
  const displayEntry = isOptimisticActive ? optimisticEntry : entry;

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <Pressable
      style={styles.likeButton}
      onPressIn={() => {
        const isCurrentlyLiked = displayEntry?.liked ?? false;
        const currentCount = displayEntry?.count ?? 0;
        if (!isCurrentlyLiked) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Compress then spring back — the spring overshoots naturally to ~1.3
          // before settling at 1, which is the characteristic Instagram pop feel.
          heartScale.value = withSequence(
            withTiming(0.75, { duration: 60 }),
            withSpring(1, { damping: 8, stiffness: 400, mass: 0.8 }),
          );
        }
        setOptimisticEntry({
          liked: !isCurrentlyLiked,
          count: isCurrentlyLiked
            ? Math.max(0, currentCount - 1)
            : currentCount + 1,
        });
        onToggle();
      }}
      accessibilityRole="button"
      accessibilityLabel={displayEntry?.liked ? "Unlike image" : "Like image"}
    >
      <AnimatedIonicons
        name={displayEntry?.liked ? "heart" : "heart-outline"}
        size={32}
        color={displayEntry?.liked ? colors.like : colors.textOnPrimary}
        style={animatedHeartStyle}
      />
      <Text
        style={[
          styles.likeCount,
          { opacity: (displayEntry?.count ?? 0) > 0 ? 1 : 0 },
        ]}
      >
        {displayEntry?.count ?? 0}
      </Text>
    </Pressable>
  );
};
