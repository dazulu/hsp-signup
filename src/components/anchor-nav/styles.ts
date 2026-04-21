import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, radii, space, fontFamily, fontSize, shadows } = theme;

export const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.xl,
    ...shadows.subtle,
  },
  container: {
    flexDirection: "row",
    gap: space[8],
    paddingHorizontal: space[14],
    paddingVertical: space[8],
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    top: space[8],
    bottom: space[8],
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
  },
  pill: {
    paddingHorizontal: space[16],
    paddingVertical: space[8],
    borderRadius: radii.lg,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    includeFontPadding: false,
  },
  labelActive: {
    color: colors.textOnPrimary,
  },
});
