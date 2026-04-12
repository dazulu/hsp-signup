import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { colors, fontFamily, fontSize, space } = theme;

export const styles = StyleSheet.create({
  list: {
    marginTop: space[8],
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space[6],
  },
  item: {
    flexBasis: "47%",
    flexGrow: 1,
  },
  itemPressed: {
    opacity: 0.7,
  },
  label: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    paddingRight: 1,
  },
});
