import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, fontFamily, fontSize, radii, shadows, space } = theme;

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    ...shadows.card,
  },
  cardTransparent: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  title: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
    color: colors.textMuted,
    marginBottom: space[4],
  },
  caret: {
    position: "absolute",
    bottom: space[16],
    right: space[16],
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
