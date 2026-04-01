import { StyleSheet } from "react-native";
import { theme } from "../theme";

const { colors, fontFamily, fontSize, radii, space } = theme;

export const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: space[16],
    paddingTop: space[40],
  },
  thumbnail: {
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  headerContainer: {
    marginBottom: space[16],
    paddingHorizontal: space[4],
  },
  description: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    marginBottom: space[8],
  },
  date: {
    color: colors.textMuted,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
  },
  columnWrapper: {
    gap: space[4],
    marginBottom: space[4],
  },
});
