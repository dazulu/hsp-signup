import { useFonts } from "@expo-google-fonts/plus-jakarta-sans";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BookingForm } from "./components/booking";
import { styles } from "./styles";

export default function App() {
  const [fontsLoaded] = useFonts({
    "jakarta-400": require("@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf"),
    "jakarta-500": require("@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf"),
    "jakarta-600": require("@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf"),
    "jakarta-700": require("@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf"),
    "jakarta-800": require("@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <LinearGradient
          colors={["#e8f0fe", "#d4e4fc", "#f0e6ff"]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A6CF7" />
          </SafeAreaView>
        </LinearGradient>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={["#e8f0fe", "#d4e4fc", "#f0e6ff"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.flex}>
          <BookingForm />
        </SafeAreaView>
      </LinearGradient>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
