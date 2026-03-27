import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { fontFamily, fontSize, space } = theme;

export const styles = StyleSheet.create({
  value: {
    marginTop: space[4],
    fontSize: fontSize["2xl"],
    fontFamily: fontFamily.semibold,
    lineHeight: fontSize["2xl"] * 1.2,
  },
});
