import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { space } = theme;

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space[6],
    marginTop: space[4],
  },
});
