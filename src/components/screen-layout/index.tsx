import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenLayoutProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function ScreenLayout({ title, subtitle, children }: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 36,
    fontFamily: "jakarta-800",
    color: "#505f94",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "jakarta-400",
    color: "#505f94",
    marginTop: 2,
    maxWidth: "70%",
  },
});
