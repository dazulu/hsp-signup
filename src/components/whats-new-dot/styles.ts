import { StyleSheet } from "react-native";
import { theme } from "../../theme";

const { colors } = theme;

const DOT_SIZE = 10;

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    width: DOT_SIZE,
    height: DOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  ring: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.notificationDot,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.notificationDot,
    borderWidth: 2,
    borderColor: "#ffffff", // white border so the dot pops on any crest colour
  },
});
