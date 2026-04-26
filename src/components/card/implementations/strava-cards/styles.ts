import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { colors, fontFamily, fontSize, space } = theme;

export const styles = StyleSheet.create({
  statsList: {
    gap: space[4],
  },
  statRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  statLabel: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  statSubvalue: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
});
