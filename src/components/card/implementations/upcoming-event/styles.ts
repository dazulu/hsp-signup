import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { space } = theme;

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[6],
  },
});
