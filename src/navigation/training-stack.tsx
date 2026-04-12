import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TrainingScreen } from "../screens/training";
import { TrainingInfoScreen } from "../screens/training-info";
import type { TrainingStackParamList } from "./types";

const Stack = createNativeStackNavigator<TrainingStackParamList>();

export const TrainingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
    <Stack.Screen name="TrainingHome" component={TrainingScreen} />
    <Stack.Screen name="TrainingInfo" component={TrainingInfoScreen} />
  </Stack.Navigator>
);
