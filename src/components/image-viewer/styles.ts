import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, fontFamily, fontSize, radii, space } = theme;

export const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  closeButton: {
    position: "absolute",
    zIndex: 110,
    right: space[16],
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButton: {
    position: "absolute",
    zIndex: 110,
    left: space[16],
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  indexIndicator: {
    position: "absolute",
    bottom: space[40],
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radii.xl,
    paddingHorizontal: space[14],
    paddingVertical: space[6],
  },
  indexText: {
    color: colors.textOnPrimary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    includeFontPadding: false,
  },
  likeButton: {
    position: "absolute",
    zIndex: 110,
    right: space[16],
    bottom: space[40] + 52,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  likeCount: {
    color: colors.textOnPrimary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    includeFontPadding: false,
    textAlign: "center",
    marginTop: -2,
  },
  page: {
    alignItems: "center",
    justifyContent: "center",
  },
});
