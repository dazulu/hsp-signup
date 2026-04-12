import { StyleSheet } from "react-native";
import { theme } from "../theme";

const { colors, space, fontFamily, fontSize } = theme;

export const styles = StyleSheet.create({
  scroll: {
    padding: space[16],
    paddingTop: space[16],
    gap: space[16],
  },
  sectionTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    marginBottom: space[12],
    includeFontPadding: false,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowGap: {
    flexDirection: "column",
    gap: space[6],
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
