import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "@expo-google-fonts/plus-jakarta-sans";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ErrorBoundary } from "./components/error-boundary";
import { UpdateBanner } from "./components/update-banner";
import { MobileAppDataProvider } from "./context/mobile-app-data";
import { useOtaUpdate } from "./hooks/use-ota-update";
import { LocaleProvider, useLocale } from "./i18n";
import { BookScreen } from "./screens/book";
import { ClubScreen } from "./screens/club";
import { PhotosScreen } from "./screens/photos";
import { SettingsScreen } from "./screens/settings";
import { UpcomingEventsScreen } from "./screens/upcoming-events";
import { styles } from "./styles";
import { theme } from "./theme";

const { colors, radii, space, fontFamily, fontSize, shadows } = theme;

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: "transparent" },
};

const Tab = createBottomTabNavigator();

const TAB_LABEL_KEYS: Record<
  string,
  "tab.club" | "tab.book" | "tab.photos" | "tab.settings"
> = {
  Club: "tab.club",
  Book: "tab.book",
  Photos: "tab.photos",
  Settings: "tab.settings",
};

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Club: { active: "shield", inactive: "shield-outline" },
  Book: { active: "calendar", inactive: "calendar-outline" },
  Photos: { active: "images", inactive: "images-outline" },
  Settings: { active: "settings", inactive: "settings-outline" },
};

const TAB_BAR_HEIGHT = 88;

function AppShell() {
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const { updateReady, applyUpdate } = useOtaUpdate();

  return (
    <View style={shellStyles.root}>
      <LinearGradient
        colors={["#e8f0fe", "#d4e4fc", "#f0e6ff"]}
        style={StyleSheet.absoluteFill}
      />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          initialRouteName="Club"
          screenOptions={({ route }) => ({
            animation: "shift",
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabel: TAB_LABEL_KEYS[route.name]
              ? t(TAB_LABEL_KEYS[route.name])
              : route.name,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              borderTopWidth: 0,
              height: TAB_BAR_HEIGHT,
              ...shadows.card,
            },
            tabBarItemStyle: {
              paddingTop: space[10],
            },
            tabBarLabelStyle: {
              fontFamily: fontFamily.semibold,
              fontSize: fontSize.md,
            },
            tabBarIcon: ({ focused, color, size }) => {
              const icon = TAB_ICONS[route.name];
              const pillW = size * 2;
              const pillH = size + 4;
              return (
                <View
                  style={{
                    width: pillW,
                    height: pillH,
                    borderRadius: pillH / 2,
                    backgroundColor: focused
                      ? colors.surfaceInput
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={
                      (focused
                        ? icon?.active
                        : icon?.inactive) as React.ComponentProps<
                        typeof Ionicons
                      >["name"]
                    }
                    size={size}
                    color={color}
                  />
                </View>
              );
            },
          })}
        >
          <Tab.Screen name="Club" component={ClubScreen} />
          <Tab.Screen name="Book" component={BookScreen} />
          <Tab.Screen name="Photos" component={PhotosScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
          <Tab.Screen
            name="UpcomingEvents"
            component={UpcomingEventsScreen}
            options={{
              tabBarButton: () => null,
              tabBarItemStyle: { display: "none" },
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <UpdateBanner
        visible={updateReady}
        onPress={applyUpdate}
        style={{ bottom: TAB_BAR_HEIGHT + 20 }}
      />
      <View
        style={[shellStyles.crestWrap, { top: insets.top + 24 }]}
        pointerEvents="none"
      >
        <Image
          source={require("../assets/crest.png")}
          style={shellStyles.crest}
          resizeMode="contain"
        />
        <View style={shellStyles.betaBadge}>
          <Text style={shellStyles.betaText}>BETA</Text>
        </View>
      </View>
    </View>
  );
}

export const App = () => {
  const [fontsLoaded] = useFonts({
    "jakarta-400": require("@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf"),
    "jakarta-500": require("@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf"),
    "jakarta-600": require("@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf"),
    "jakarta-700": require("@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf"),
    "jakarta-800": require("@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <LinearGradient
              colors={["#e8f0fe", "#d4e4fc", "#f0e6ff"]}
              style={styles.gradient}
            >
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A6CF7" />
              </View>
            </LinearGradient>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LocaleProvider>
            <MobileAppDataProvider>
              <AppShell />
            </MobileAppDataProvider>
          </LocaleProvider>
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const shellStyles = StyleSheet.create({
  root: { flex: 1 },
  crestWrap: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
  },
  crest: {
    width: 58,
    height: 58,
  },
  betaBadge: {
    alignSelf: "center",
    marginTop: 4,
    backgroundColor: "#b0c8ee",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  betaText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "jakarta-700",
    letterSpacing: 1,
    includeFontPadding: false,
  },
});
