import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, space, fontFamily, fontSize } = theme;

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[6],
    paddingVertical: space[14],
  },
  rowPressed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    color: colors.errorText,
    includeFontPadding: false,
  },
});
