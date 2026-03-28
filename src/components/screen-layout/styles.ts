import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, fontFamily, fontSize, space } = theme;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: {
    paddingHorizontal: space[24],
    paddingBottom: space[8],
  },
  title: {
    fontSize: fontSize["3xl"],
    fontFamily: fontFamily.extrabold,
    color: colors.textBrand,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.regular,
    color: colors.textBrand,
    lineHeight: 26,
    marginTop: space[8],
    maxWidth: "77%",
  },
});
