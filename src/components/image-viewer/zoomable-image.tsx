import { Image } from "expo-image";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { fullImageUrl } from "../../services/contentful/images";
import { styles } from "./styles";
import type { ZoomableImageProps } from "./types";

const SPRING_CONFIG = { damping: 20, stiffness: 200 };
const DISMISS_THRESHOLD = 100;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 3;

export const ZoomableImage = ({
  image,
  width,
  height,
  onSwipeDown,
}: ZoomableImageProps) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const imageAspect = image.width / image.height;
  // Fit the image within the screen dimensions without overflowing
  const fitsLandscape = imageAspect >= width / height;
  const displayWidth = fitsLandscape ? width : height * imageAspect;
  const displayHeight = fitsLandscape ? width / imageAspect : height;

  const pinchGesture = Gesture.Pinch()
    .onUpdate((gestureEvent) => {
      scale.value = Math.min(savedScale.value * gestureEvent.scale, MAX_SCALE);
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1, SPRING_CONFIG);
        savedScale.value = 1;
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((gestureEvent) => {
      if (savedScale.value > 1) {
        translateX.value = savedTranslateX.value + gestureEvent.translationX;
        translateY.value = savedTranslateY.value + gestureEvent.translationY;
      } else {
        translateY.value = gestureEvent.translationY;
      }
    })
    .onEnd((gestureEvent) => {
      if (savedScale.value <= 1) {
        if (Math.abs(gestureEvent.translationY) > DISMISS_THRESHOLD) {
          runOnJS(onSwipeDown)();
        }
        translateY.value = withSpring(0, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
      } else {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.value > 1) {
        scale.value = withSpring(1, SPRING_CONFIG);
        savedScale.value = 1;
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(DOUBLE_TAP_SCALE, SPRING_CONFIG);
        savedScale.value = DOUBLE_TAP_SCALE;
      }
    });

  const composed = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Exclusive(doubleTapGesture, panGesture),
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[styles.page, { width, height }, animatedImageStyle]}
      >
        <Image
          source={{ uri: fullImageUrl(image.url, width) }}
          style={{ width: displayWidth, height: displayHeight }}
          contentFit="contain"
          transition={300}
        />
      </Animated.View>
    </GestureDetector>
  );
};
