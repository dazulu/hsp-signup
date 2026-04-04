import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../theme";
import { styles } from "./styles";
import type { ScreenLayoutContextValue, ScreenLayoutProps } from "./types";

const { colors, space } = theme;
const HEADER_CONTENT_GAP = 20;

const DEFAULT_SCROLL_Y = new Animated.Value(0);
const DEFAULT_SCROLL_HANDLER = () => {};
const DEFAULT_RESET_SCROLL_Y = () => {};

const ScreenLayoutContext = createContext<ScreenLayoutContextValue>({
  headerHeight: 0,
  contentPaddingTop: 0,
  scrollY: DEFAULT_SCROLL_Y,
  onScrollHandler: DEFAULT_SCROLL_HANDLER,
  resetScrollY: DEFAULT_RESET_SCROLL_Y,
});
export const useScreenLayout = () => useContext(ScreenLayoutContext);

export const ScreenLayout = ({
  title,
  subtitle,
  onBack,
  children,
}: ScreenLayoutProps) => {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const contentPaddingTop = headerHeight + HEADER_CONTENT_GAP;
  const onScrollHandler = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.setValue(event.nativeEvent.contentOffset.y);
    },
    [scrollY],
  );
  const resetScrollY = useCallback(() => {
    scrollY.setValue(0);
  }, [scrollY]);
  const subtitleOpacity = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [1, 0],
        extrapolate: "clamp",
      }),
    [scrollY],
  );

  const onHeaderLayout = useCallback((e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <ScreenLayoutContext.Provider
      value={{
        headerHeight,
        contentPaddingTop,
        scrollY,
        onScrollHandler,
        resetScrollY,
      }}
    >
      <View style={styles.container}>
        <View style={[styles.content, !headerHeight && styles.contentHidden]}>
          {children}
        </View>
        <View
          onLayout={onHeaderLayout}
          style={[styles.header, { paddingTop: insets.top + space[16] }]}
          pointerEvents="box-none"
        >
          <LinearGradient
            colors={["#e8f0fe", "#d4e4fc", "rgba(232,240,254,0)"]}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View>
            {onBack ? (
              <View style={styles.titleRow}>
                <Pressable
                  onPress={onBack}
                  style={styles.backButton}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <Ionicons
                    name="chevron-back"
                    size={28}
                    color={colors.textBrand}
                  />
                </Pressable>
                <Text style={styles.titleWithBack}>{title}</Text>
              </View>
            ) : (
              <Text style={styles.title}>{title}</Text>
            )}
            {subtitle ? (
              <Animated.Text
                style={[styles.subtitle, { opacity: subtitleOpacity }]}
              >
                {subtitle}
              </Animated.Text>
            ) : null}
          </View>
        </View>
      </View>
    </ScreenLayoutContext.Provider>
  );
};
