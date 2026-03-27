import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    shadowColor: "#8ba4e8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  cardPressable: {
    paddingBottom: 40,
  },
  caret: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
