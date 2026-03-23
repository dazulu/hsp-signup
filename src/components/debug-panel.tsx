import { Pressable, Text, View } from "react-native";
import { styles } from "../styles";

type Props = {
  onFakeLoading: () => void;
  onFakeSuccess: () => void;
  onFakeFailure: () => void;
  onFakeLastBooking: () => void;
  onReset: () => void;
  onClose: () => void;
};

export function DebugPanel({
  onFakeLoading,
  onFakeSuccess,
  onFakeFailure,
  onFakeLastBooking,
  onReset,
  onClose,
}: Props) {
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
}
