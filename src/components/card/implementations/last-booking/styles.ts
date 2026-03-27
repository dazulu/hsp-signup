import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { colors, fontFamily, fontSize, space } = theme;

export const styles = StyleSheet.create({
  bookingText: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
    marginTop: space[4],
  },
});
