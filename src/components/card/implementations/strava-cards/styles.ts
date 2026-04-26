import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { fontFamily, fontSize, space } = theme;

export const styles = StyleSheet.create({
  name: {
    marginTop: space[4],
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    lineHeight: fontSize.body * 1.4,
  },
  value: {
    marginTop: 2,
    fontSize: fontSize["2xl"],
    fontFamily: fontFamily.semibold,
    lineHeight: fontSize["2xl"] * 1.2,
  },
});
