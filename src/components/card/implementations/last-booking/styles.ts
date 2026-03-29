import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { colors, space, fontFamily } = theme;

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space[6],
    marginTop: space[4],
  },
  tick: {
    color: colors.successText,
    fontFamily: fontFamily.bold,
    fontSize: 14,
  },
});
