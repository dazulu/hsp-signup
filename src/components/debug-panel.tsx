import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onFakeLoading: () => void;
  onFakeSuccess: () => void;
  onFakeFailure: () => void;
  onFakeLastBooking: () => void;
  onReset: () => void;
  onClose: () => void;
};

export const DebugPanel = ({
  onFakeLoading,
  onFakeSuccess,
  onFakeFailure,
  onFakeLastBooking,
  onReset,
  onClose,
}: Props) => {
  return (
    <View style={styles.debugPanel}>
      <View style={styles.debugHeader}>
        <Text style={styles.debugTitle}>Debug</Text>
        <Pressable onPress={onClose} accessibilityLabel="Close debug panel">
          <Text style={styles.debugClose}>✕</Text>
        </Pressable>
      </View>
      <View style={styles.debugRow}>
        <Pressable style={styles.debugBtn} onPress={onFakeLoading}>
          <Text style={styles.debugBtnText}>Fake Loading</Text>
        </Pressable>
        <Pressable style={styles.debugBtn} onPress={onFakeLastBooking}>
          <Text style={styles.debugBtnText}>Fake Last Booking</Text>
        </Pressable>
        <Pressable
          style={[styles.debugBtn, styles.debugBtnReset]}
          onPress={onReset}
        >
          <Text style={styles.debugBtnText}>Reset</Text>
        </Pressable>
      </View>
      <View style={[styles.debugRow, { marginTop: 8 }]}>
        <Pressable style={styles.debugBtn} onPress={onFakeSuccess}>
          <Text style={styles.debugBtnText}>Fake Success</Text>
        </Pressable>
        <Pressable
          style={[styles.debugBtn, styles.debugBtnReset]}
          onPress={onFakeFailure}
        >
          <Text style={styles.debugBtnText}>Fake Failure</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  debugPanel: {
    backgroundColor: "#1a1f36",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  debugHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  debugTitle: {
    color: "#ff6b6b",
    fontFamily: "jakarta-700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  debugClose: {
    color: "#ff6b6b",
    fontSize: 16,
    fontFamily: "jakarta-700",
    paddingHorizontal: 4,
  },
  debugRow: {
    flexDirection: "row",
    gap: 8,
  },
  debugBtn: {
    flex: 1,
    backgroundColor: "#2d3352",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  debugBtnReset: {
    backgroundColor: "#4a2030",
  },
  debugBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "jakarta-600",
  },
});
