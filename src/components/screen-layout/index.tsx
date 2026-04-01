import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { createContext, useCallback, useContext, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../theme";

const { space, colors } = theme;
const HEADER_CONTENT_GAP = 20;

import { styles } from "./styles";
import type { ScreenLayoutContextValue, ScreenLayoutProps } from "./types";

const ScreenLayoutContext = createContext<ScreenLayoutContextValue>({
  headerHeight: 0,
});
export const useScreenLayout = () => useContext(ScreenLayoutContext);

export const ScreenLayout = ({
  title,
  subtitle,
  showBackButton,
  children,
}: ScreenLayoutProps) => {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const navigation = useNavigation();

  const onHeaderLayout = useCallback((e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <ScreenLayoutContext.Provider value={{ headerHeight }}>
      <View style={styles.container}>
        <View
          style={[
            styles.content,
            {
              paddingTop:
                insets.top + space[16] + headerHeight + HEADER_CONTENT_GAP,
            },
          ]}
        >
          {children}
        </View>
        <LinearGradient
          colors={["#e8f0fe", "#d4e4fc", "rgba(232,240,254,0)"]}
          locations={[0, 0.5, 1]}
          style={[styles.header, { paddingTop: insets.top + space[16] }]}
          pointerEvents="box-none"
        >
          <View onLayout={onHeaderLayout}>
            {showBackButton ? (
              <View style={styles.titleRow}>
                <Pressable
                  onPress={() => navigation.goBack()}
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
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </LinearGradient>
      </View>
    </ScreenLayoutContext.Provider>
  );
};
