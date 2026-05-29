import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, fontFamily, fontSize } = theme;

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.textMuted,
    includeFontPadding: false,
  },
  rowValue: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    includeFontPadding: false,
  },
});
