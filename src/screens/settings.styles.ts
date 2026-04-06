import { StyleSheet } from "react-native";
import { theme } from "../theme";

const { colors, radii, space, fontFamily, fontSize, shadows } = theme;

export const styles = StyleSheet.create({
  scroll: {
    padding: space[16],
    paddingTop: space[16],
    gap: space[16],
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: space[20],
    ...shadows.card,
  },
  sectionTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    marginBottom: space[12],
    includeFontPadding: false,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.textMuted,
    includeFontPadding: false,
  },
  rowValue: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  privacyLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[6],
    paddingVertical: space[14],
  },
  privacyRowPressed: {
    opacity: 0.6,
  },
  privacyDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  privacyLink: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    color: colors.primary,
    includeFontPadding: false,
  },
});
