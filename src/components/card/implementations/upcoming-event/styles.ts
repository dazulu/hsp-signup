import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { colors, fontFamily, fontSize, radii, space } = theme;

export const styles = StyleSheet.create({
  content: {
    marginTop: space[4],
    gap: space[8],
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space[6],
  },
  rowIcon: {
    top: 4,
  },
  rowText: {
    flex: 1,
  },
  pill: {
    paddingHorizontal: space[8],
    paddingVertical: space[4],
    borderRadius: radii.sm,
    backgroundColor: "#eef1fe",
  },
  pillToday: {
    backgroundColor: colors.successBackground,
  },
  pillText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold,
    color: colors.primary,
  },
  pillTextToday: {
    color: colors.successText,
    includeFontPadding: false,
  },
});
