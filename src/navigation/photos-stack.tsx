import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GalleryDetailScreen } from "../screens/gallery-detail";
import { PhotosScreen } from "../screens/photos";
import type { PhotosStackParamList } from "./types";

const Stack = createNativeStackNavigator<PhotosStackParamList>();

export const PhotosStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
    <Stack.Screen name="Photos" component={PhotosScreen} />
    <Stack.Screen name="GalleryDetail" component={GalleryDetailScreen} />
  </Stack.Navigator>
);
