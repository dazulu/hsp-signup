import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LearnHomeScreen } from "../screens/learn/home";
import { SportDetailScreen } from "../screens/learn/sport-detail";
import type { LearnStackParamList } from "./types";

const Stack = createNativeStackNavigator<LearnStackParamList>();

export const LearnStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
    <Stack.Screen name="LearnHome" component={LearnHomeScreen} />
    <Stack.Screen name="SportDetail" component={SportDetailScreen} />
  </Stack.Navigator>
);
