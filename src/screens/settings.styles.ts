import { StyleSheet } from "react-native";
import { theme } from "../theme";

const { colors, radii, space, fontFamily, fontSize, shadows } = theme;

export const styles = StyleSheet.create({
  scroll: {
    padding: space[16],
    paddingTop: space[16] + 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: space[20],
    ...shadows.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
});
