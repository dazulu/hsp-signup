import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, fontFamily, fontSize, space } = theme;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: { flex: 1 },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space[24],
    paddingBottom: 48,
    zIndex: 10,
  },
  title: {
    fontSize: fontSize["3xl"],
    fontFamily: fontFamily.extrabold,
    color: colors.textBrand,
    marginRight: 70,
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
