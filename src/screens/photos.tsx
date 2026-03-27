import { StyleSheet, Text, View } from "react-native";
import { ScreenLayout } from "../components/screen-layout";

export const PhotosScreen = () => {
  return (
    <ScreenLayout title="Photos">
      <View style={styles.content}>
        <Text style={styles.placeholder}>Coming soon</Text>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    color: "#7080aa",
    fontFamily: "jakarta-400",
    fontSize: 16,
  },
});
