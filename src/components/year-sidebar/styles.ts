import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, fontFamily, fontSize, radii, space } = theme;

export const styles = StyleSheet.create({
  absoluteWrapper: {
    position: "absolute",
    right: space[8],
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 10,
  },
  container: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radii.lg,
    paddingVertical: space[6],
    paddingHorizontal: space[6],
  },
  yearButton: {
    paddingVertical: space[6],
    paddingHorizontal: space[4],
    alignItems: "center",
    justifyContent: "center",
  },
  yearText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  yearTextActive: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
  },
});
