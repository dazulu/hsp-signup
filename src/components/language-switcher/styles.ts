import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, radii, space, fontFamily, fontSize, shadows } = theme;

export const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceInput,
    borderRadius: radii.md,
    paddingVertical: space[10],
    paddingHorizontal: space[14],
  },
  triggerText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  chevron: {
    marginLeft: space[6],
  },
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
    ...shadows.card,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: space[14],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  optionTextActive: {
    fontFamily: fontFamily.semibold,
    color: colors.primary,
  },
});
