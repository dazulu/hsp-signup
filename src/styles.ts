import { StyleSheet } from "react-native";

// App-shell styles shared by App.tsx and App.native.tsx only.
// Component styles are colocated with their components.
export const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
