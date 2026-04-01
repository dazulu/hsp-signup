import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { colors, fontFamily, fontSize } = theme;

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  icon: {
    top: 6,
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.noticeText,
    lineHeight: 20,
    includeFontPadding: false,
  },
});
