import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { fontFamily, fontSize, radii, space } = theme;

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
    color: "rgba(255,255,255,0.85)",
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    includeFontPadding: false,
  },
  page: {
    alignItems: "center",
    justifyContent: "center",
  },
});
