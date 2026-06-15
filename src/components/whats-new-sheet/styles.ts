import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, radii, space, fontFamily, fontSize, shadows } = theme;

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: space[20],
    paddingBottom: space[40],
    paddingHorizontal: space[24],
    maxHeight: "80%",
    ...shadows.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space[20],
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  closeButton: {
    padding: space[4],
  },
  scrollContent: {
    gap: space[16],
  },
  item: {
    backgroundColor: colors.surfaceInput,
    borderRadius: radii.xl,
    padding: space[16],
    gap: space[8],
  },
  itemNew: {
    backgroundColor: "#eef1fe",
    borderWidth: 1.5,
    borderColor: "#c5cef9",
  },
  itemTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  itemBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    includeFontPadding: false,
  },
  ctaButton: {
    alignSelf: "flex-start",
    marginTop: space[4],
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: space[8],
    paddingHorizontal: space[14],
  },
  ctaLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.textOnPrimary,
    includeFontPadding: false,
  },
});
