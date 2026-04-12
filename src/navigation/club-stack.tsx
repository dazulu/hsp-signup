import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ClubScreen } from "../screens/club";
import { UpcomingEventsScreen } from "../screens/upcoming-events";
import type { ClubStackParamList } from "./types";

const Stack = createNativeStackNavigator<ClubStackParamList>();

export const ClubStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
    <Stack.Screen name="ClubHome" component={ClubScreen} />
    <Stack.Screen name="UpcomingEvents" component={UpcomingEventsScreen} />
  </Stack.Navigator>
);
