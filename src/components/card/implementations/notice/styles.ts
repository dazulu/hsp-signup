import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { colors, fontFamily, fontSize } = theme;

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginTop: 1,
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
