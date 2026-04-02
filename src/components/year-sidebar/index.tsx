import { useCallback, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { styles } from "./styles";
import type { YearSidebarProps } from "./types";

const ITEM_HEIGHT = 32;

export const YearSidebar = ({
  years,
  activeYear,
  onYearPress,
}: YearSidebarProps) => {
  const lastEmittedYear = useRef<number | null>(null);

  const getYearFromY = useCallback(
    (yPosition: number) => {
      const index = Math.min(
        Math.max(Math.floor(yPosition / ITEM_HEIGHT), 0),
        years.length - 1,
      );
      return years[index] ?? null;
    },
    [years],
  );

  const panGesture = Gesture.Pan()
    .onStart((gestureEvent) => {
      const year = getYearFromY(gestureEvent.y);
      if (year !== null) {
        lastEmittedYear.current = year;
        onYearPress(year);
      }
    })
    .onUpdate((gestureEvent) => {
      const year = getYearFromY(gestureEvent.y);
      if (year !== null && year !== lastEmittedYear.current) {
        lastEmittedYear.current = year;
        onYearPress(year);
      }
    })
    .onEnd(() => {
      lastEmittedYear.current = null;
    });

  if (years.length <= 1) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.absoluteWrapper}>
        <View style={styles.container}>
          {years.map((year) => (
            <Pressable
              key={year}
              style={[styles.yearButton, { height: ITEM_HEIGHT }]}
              onPress={() => onYearPress(year)}
              accessibilityRole="button"
              accessibilityLabel={String(year)}
            >
              <Text
                style={[
                  styles.yearText,
                  activeYear === year && styles.yearTextActive,
                ]}
              >
                {year}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </GestureDetector>
  );
};
