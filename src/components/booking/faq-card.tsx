import { Ionicons } from "@expo/vector-icons";
import { Fragment, useCallback, useRef, useState } from "react";
import { type LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useLocale } from "../../i18n";
import type { TranslationKey } from "../../i18n/types";
import { theme } from "../../theme";
import { Card } from "../card";
import { styles } from "./styles";

const { colors } = theme;

const FAQ_ITEMS: { questionKey: TranslationKey; answerKey: TranslationKey }[] =
  [
    { questionKey: "booking.faq.q1", answerKey: "booking.faq.a1" },
    { questionKey: "booking.faq.q2", answerKey: "booking.faq.a2" },
    { questionKey: "booking.faq.q3", answerKey: "booking.faq.a3" },
    { questionKey: "booking.faq.q4", answerKey: "booking.faq.a4" },
  ];

const FaqItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [open, setOpen] = useState(false);
  const heightAnim = useSharedValue(0);
  const measuredHeightRef = useRef(0);

  const onMeasureLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0) {
      measuredHeightRef.current = height;
    }
  }, []);

  const toggle = useCallback(() => {
    const next = !open;
    setOpen(next);
    heightAnim.value = withTiming(next ? measuredHeightRef.current : 0, {
      duration: 250,
    });
  }, [open, heightAnim]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: heightAnim.value,
    overflow: "hidden",
  }));

  return (
    <View>
      <Pressable
        style={styles.faqRow}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={question}
      >
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.textMuted}
        />
      </Pressable>

      {/* Invisible layout helper — absolutely positioned so Yoga computes its
          natural height independently of the animated container's height: 0. */}
      <View
        pointerEvents="none"
        onLayout={onMeasureLayout}
        style={styles.faqMeasureHelper}
      >
        <Text style={styles.faqAnswer}>{answer}</Text>
      </View>

      <Reanimated.View style={animatedContainerStyle}>
        <Text style={styles.faqAnswer}>{answer}</Text>
      </Reanimated.View>
    </View>
  );
};

export const FaqCard = () => {
  const { t } = useLocale();

  return (
    <Card padding="md" span={2}>
      <Text style={styles.faqTitle}>{t("booking.faq.title")}</Text>
      {FAQ_ITEMS.map(({ questionKey, answerKey }, index) => (
        <Fragment key={questionKey}>
          {index > 0 && <View style={styles.faqDivider} />}
          <FaqItem question={t(questionKey)} answer={t(answerKey)} />
        </Fragment>
      ))}
    </Card>
  );
};
