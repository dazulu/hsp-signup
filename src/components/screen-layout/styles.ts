import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, fontFamily, fontSize, space } = theme;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: { flex: 1 },
  contentHidden: { opacity: 0 },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    paddingHorizontal: space[24],
    paddingBottom: space[16],
    zIndex: 10,
  },
  title: {
    fontSize: fontSize["3xl"],
    fontFamily: fontFamily.extrabold,
    color: colors.textBrand,
    marginRight: 70,
    includeFontPadding: false,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: 70,
  },
  backButton: {
    left: -12,
    top: 10,
  },
  titleWithBack: {
    flex: 1,
    left: -5,
    fontSize: fontSize["3xl"],
    fontFamily: fontFamily.extrabold,
    color: colors.textBrand,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.regular,
    color: colors.textBrand,
    lineHeight: 24,
    marginTop: space[8],
    maxWidth: "77%",
  },
});
