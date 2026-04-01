import { StyleSheet } from "react-native";
import { theme } from "../theme";

const { colors, fontFamily, fontSize, space } = theme;

export const styles = StyleSheet.create({
  list: {
    paddingHorizontal: space[16],
    paddingTop: space[40],
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: space[40],
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
  },
  errorText: {
    color: colors.errorText,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    textAlign: "center",
    paddingHorizontal: space[24],
  },
});
