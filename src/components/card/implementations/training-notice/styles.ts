import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { colors, fontFamily, fontSize } = theme;

export const styles = StyleSheet.create({
  message: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textOnPrimary,
    lineHeight: 20,
  },
});
