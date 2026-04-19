import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { fontFamily, fontSize, space } = theme;

export const styles = StyleSheet.create({
  dismissButton: {
    marginTop: space[12],
    alignSelf: "flex-start",
  },
  dismissText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: "rgba(255, 255, 255, 0.65)",
  },
  heading: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.extrabold,
    color: "white",
    marginBottom: space[4],
  },
  body: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.regular,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 22,
  },
});
