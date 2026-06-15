import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, space, fontFamily, fontSize } = theme;

export const styles = StyleSheet.create({
  container: {
    gap: space[12],
  },
  sectionTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  helper: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    includeFontPadding: false,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: space[4],
  },
  rowLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    includeFontPadding: false,
    flex: 1,
    marginRight: space[12],
  },
  blockedContainer: {
    gap: space[10],
    padding: space[10],
    borderRadius: 12,
    backgroundColor: colors.warningBackground,
  },
  blockedNotice: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.warningText,
    includeFontPadding: false,
  },
  openSettingsButton: {
    alignSelf: "stretch",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space[12],
    borderRadius: 14,
    backgroundColor: colors.warningAction,
  },
  openSettingsButtonPressed: {
    opacity: 0.7,
  },
  openSettingsLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.surface,
    includeFontPadding: false,
  },
});
