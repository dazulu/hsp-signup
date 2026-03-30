import { StyleSheet } from "react-native";
import { theme } from "../theme";

const { colors, fontFamily, fontSize, radii, space } = theme;

export const styles = StyleSheet.create({
  scroll: {
    padding: space[16],
    paddingTop: space[16],
  },
  sportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: space[4],
  },
  sportLabel: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  sportTime: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: space[4],
  },
  transportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[10],
    marginTop: space[10],
  },
  transportIcon: {
    width: 22,
    height: 22,
  },
  transportLabel: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    flexShrink: 1,
    includeFontPadding: false,
  },
  mapImage: {
    width: "100%",
    height: 200,
    borderRadius: radii.lg,
    marginTop: space[16],
    marginBottom: space[8],
  },
  introText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
  },
  credits: {
    marginTop: space[16],
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    textAlign: "center",
  },
});
