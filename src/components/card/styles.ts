import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, fontFamily, fontSize, radii, shadows, space } = theme;

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadows.card,
  },
  cardTransparent: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  cardNotice: {
    backgroundColor: colors.noticeBackground,
    borderWidth: 2,
    borderColor: colors.noticeBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  title: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
    color: colors.textMuted,
    marginBottom: space[4],
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[4],
    marginBottom: space[4],
  },
  bodyText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  caret: {
    position: "absolute",
    top: space[18],
    right: space[14],
  },
  backgroundImage: {
    position: "absolute",
    bottom: -5,
    right: -5,
    width: 64,
    height: 64,
    opacity: 0.15,
    transform: [{ rotateZ: "15deg" }],
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
