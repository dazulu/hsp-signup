import { StyleSheet } from "react-native";
import { theme } from "../theme";

const { colors, fontFamily, fontSize, space } = theme;

export const styles = StyleSheet.create({
  scroll: {
    padding: space[16],
    paddingBottom: space[32],
  },
  cardContent: {
    gap: space[6],
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: space[4],
  },
  location: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
  },
  date: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
