import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { colors, space, fontFamily, radii, fontSize } = theme;

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space[6],
    marginTop: space[4],
  },
  tick: {
    color: colors.successText,
    fontFamily: fontFamily.bold,
    fontSize: 14,
  },
  nudgePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    backgroundColor: colors.warningBackground,
    borderRadius: radii.lg,
    paddingVertical: space[6],
    paddingLeft: space[18],
    paddingRight: space[10],
    marginTop: space[8],
    gap: space[6],
  },
  nudgeText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.warningText,
    includeFontPadding: false,
  },
});
