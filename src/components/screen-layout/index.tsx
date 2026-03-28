import { LinearGradient } from "expo-linear-gradient";
import { createContext, useCallback, useContext, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../theme";

const { space } = theme;

import { styles } from "./styles";
import type { ScreenLayoutContextValue, ScreenLayoutProps } from "./types";

const ScreenLayoutContext = createContext<ScreenLayoutContextValue>({
  headerHeight: 0,
});
export const useScreenLayout = () => useContext(ScreenLayoutContext);

export const ScreenLayout = ({
  title,
  subtitle,
  children,
}: ScreenLayoutProps) => {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);

  const onHeaderLayout = useCallback((e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <ScreenLayoutContext.Provider value={{ headerHeight }}>
      <View style={styles.container}>
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + space[16] + headerHeight },
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
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </LinearGradient>
      </View>
    </ScreenLayoutContext.Provider>
  );
};
