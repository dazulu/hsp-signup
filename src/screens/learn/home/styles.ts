import { StyleSheet } from "react-native";
import { theme } from "../../../theme";

const { colors, space, fontFamily, fontSize } = theme;

export const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: space[16],
    paddingBottom: space[40],
  },
  clubHeading: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: space[8],
  },
  clubBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: space[8],
  },
  cardContent: {
    gap: space[4],
  },
  sportName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  cardsWrapper: {
    gap: space[12],
    marginTop: space[12],
  },
});
