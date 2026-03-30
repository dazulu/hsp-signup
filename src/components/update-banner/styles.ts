import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, fontFamily, fontSize, radii, space, shadows } = theme;

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: space[16],
    right: space[16],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.textBrand,
    borderRadius: radii.xl,
    paddingVertical: space[12],
    paddingHorizontal: space[16],
    gap: space[8],
    ...shadows.button,
  },
  text: {
    color: colors.textOnPrimary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    includeFontPadding: false,
  },
});
