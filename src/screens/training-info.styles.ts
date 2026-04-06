import { StyleSheet } from "react-native";
import { theme } from "../theme";

const { colors, fontFamily, fontSize, radii, space } = theme;

export const styles = StyleSheet.create({
  scroll: {
    padding: space[16],
    paddingTop: space[16],
  },
  sectionTitle: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    color: colors.textMuted,
    marginBottom: space[6],
  },
  body: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
    includeFontPadding: false,
  },
  bulletRow: {
    flexDirection: "row",
    gap: space[8],
    marginTop: space[6],
  },
  bullet: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
    includeFontPadding: false,
  },
  bulletTextSemibold: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
    color: colors.textMuted,
    lineHeight: 20,
    includeFontPadding: false,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: space[4],
  },
  spacer: {
    height: space[10],
  },
  stepRow: {
    flexDirection: "row",
    gap: space[10],
    marginTop: space[8],
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bold,
    color: colors.textOnPrimary,
    includeFontPadding: false,
  },
  stepText: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
    includeFontPadding: false,
  },
  linkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: space[8],
    paddingHorizontal: space[12],
    backgroundColor: colors.surfaceInput,
    borderRadius: radii.md,
    marginTop: space[10],
  },
  linkItemPressed: {
    opacity: 0.7,
  },
  linkLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
});
