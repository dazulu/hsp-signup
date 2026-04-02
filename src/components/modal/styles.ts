import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, fontFamily, fontSize, radii, shadows, space } = theme;

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: space[32],
  },
  backdropDismiss: StyleSheet.absoluteFillObject,
  box: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: space[20],
    ...shadows.card,
  },
  content: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: fontSize.md * 1.5,
  },
});
