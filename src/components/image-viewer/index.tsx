import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fullImageUrl } from "../../services/contentful/images";
import type { ContentfulImageInfo } from "../../services/contentful/types";
import { styles } from "./styles";
import type { ImageViewerProps } from "./types";

const SPRING_CONFIG = { damping: 20, stiffness: 200 };
const DISMISS_THRESHOLD = 100;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 3;

type ZoomableImageProps = {
  image: ContentfulImageInfo;
  width: number;
  height: number;
  onSwipeDown: () => void;
};

const ZoomableImage = ({
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
    .onUpdate((e) => {
      scale.value = Math.min(savedScale.value * e.scale, MAX_SCALE);
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
    .onUpdate((e) => {
      if (savedScale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      } else {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (savedScale.value <= 1) {
        if (Math.abs(e.translationY) > DISMISS_THRESHOLD) {
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

export const ImageViewer = ({
  images,
  initialIndex,
  visible,
  onClose,
}: ImageViewerProps) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList<ContentfulImageInfo>>(null);
  const opacity = useSharedValue(0);

  // Sync index and trigger fade when viewer opens/closes
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      opacity.value = withTiming(1, { duration: 200 });
      // Scroll to the correct image on reopen
      if (flatListRef.current && initialIndex > 0) {
        flatListRef.current.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }
    } else {
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible, initialIndex, opacity]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
      setCurrentIndex(newIndex);
    },
    [width],
  );

  const renderItem = useCallback(
    ({ item }: { item: ContentfulImageInfo }) => (
      <ZoomableImage
        image={item}
        width={width}
        height={height}
        onSwipeDown={onClose}
      />
    ),
    [width, height, onClose],
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.rootView}>
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <StatusBar hidden />
          <Pressable
            style={[styles.closeButton, { top: insets.top + 8 }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons
              name="close-circle"
              size={32}
              color="rgba(255,255,255,0.8)"
            />
          </Pressable>

          <FlatList
            ref={flatListRef}
            data={images}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.url}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onMomentumScrollEnd={onMomentumScrollEnd}
          />

          <View style={styles.indexIndicator}>
            <Text style={styles.indexText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
};
