import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors, fontFamily, fontSize, radii, space } = theme;

export const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: space[8],
    paddingHorizontal: space[12],
    backgroundColor: colors.surfaceInput,
    borderRadius: radii.md,
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
