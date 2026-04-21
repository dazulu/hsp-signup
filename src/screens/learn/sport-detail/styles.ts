import { StyleSheet } from "react-native";
import { theme } from "../../../theme";

const { colors, radii, space, fontFamily, fontSize } = theme;

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  anchorNavWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1,
    display: "flex",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: space[16],
    paddingBottom: space[40],
  },
  sectionHeading: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: space[12],
  },
  sectionDivider: {
    height: space[24],
  },
  statsRow: {
    flexDirection: "row",
    gap: space[12],
    marginBottom: space[16],
  },
  statTile: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: space[12],
    paddingHorizontal: space[8],
    gap: space[4],
  },
  statValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize["2xl"],
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: "center",
  },
  bodyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: space[8],
  },
  scoringBlock: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: space[14],
    marginBottom: space[16],
  },
  scoringText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  ruleRow: {
    flexDirection: "row",
    gap: space[10],
    marginBottom: space[10],
  },
  ruleNumber: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.primary,
    minWidth: 20,
  },
  ruleText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
  equipmentItem: {
    flexDirection: "row",
    gap: space[14],
    marginBottom: space[16],
    alignItems: "flex-start",
  },
  equipmentImage: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceInput,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    marginBottom: space[4],
  },
  equipmentDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  drillCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: space[16],
    marginBottom: space[12],
  },
  drillTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    marginBottom: space[4],
  },
  drillDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: space[12],
  },
  stepRow: {
    flexDirection: "row",
    gap: space[10],
    marginBottom: space[8],
  },
  stepNumber: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.primary,
    minWidth: 18,
  },
  stepText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
});
