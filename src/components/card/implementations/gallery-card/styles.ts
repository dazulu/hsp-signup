import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { colors, fontFamily, fontSize, radii, space } = theme;

export const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: space[16],
  },
  image: {
    width: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space[16],
    paddingVertical: space[12],
  },
  title: {
    color: colors.textOnPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
  year: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    marginTop: space[4],
  },
});
