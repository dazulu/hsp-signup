import { Component, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

const { colors, radii, space, fontFamily, fontSize } = theme;

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
    padding: space[32],
    backgroundColor: colors.surfaceInput,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
    marginBottom: space[12],
    textAlign: "center",
  },
  body: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: space[24],
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: space[14],
    paddingHorizontal: space[32],
    borderRadius: radii.md,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.body,
    fontFamily: fontFamily.semibold,
    textAlign: "center",
  },
});
