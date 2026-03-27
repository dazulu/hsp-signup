import { Component, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Log to console in dev; swap for a remote logging service if desired
    if (__DEV__) {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  reload() {
    if (Platform.OS === "web") {
      window.location.reload();
    } else {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            Reload the app to try again. If the problem persists, touch grass.
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => this.reload()}
            accessibilityRole="button"
            accessibilityLabel="Reload app"
          >
            <Text style={styles.buttonText}>Reload</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#f4f6fb",
  },
  title: {
    fontSize: 18,
    fontFamily: "jakarta-600",
    color: "#1a1f36",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    color: "#6b7a99",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#4A6CF7",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "jakarta-600",
    textAlign: "center",
  },
});
