import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

const { space } = theme;

export const styles = StyleSheet.create({
  content: {
    marginTop: space[4],
    gap: space[8],
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space[6],
  },
});
