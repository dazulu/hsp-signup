import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ContentfulImageInfo } from "../../services/contentful/types";
import { theme } from "../../theme";
import { LikeButton } from "./like-button";
import { styles } from "./styles";
import type { ImageViewerProps } from "./types";
import { ZoomableImage } from "./zoomable-image";

const { colors } = theme;

export const ImageViewer = ({
  images,
  initialIndex,
  visible,
  onClose,
  likes,
  onIndexChange,
  onToggleLike,
}: ImageViewerProps) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [downloadState, setDownloadState] = useState<
    "idle" | "downloading" | "saved" | "error"
  >("idle");
  const flatListRef = useRef<FlatList<ContentfulImageInfo>>(null);
  const opacity = useSharedValue(0);

  const currentImageId = images[currentIndex]?.id ?? "";

  const handleDownload = useCallback(async () => {
    const currentImage = images[currentIndex];
    if (!currentImage || downloadState === "downloading") {
      return;
    }

    const { status } = await MediaLibrary.requestPermissionsAsync(true);
    if (status !== "granted") {
      return;
    }

    setDownloadState("downloading");
    try {
      const baseUrl = currentImage.url.startsWith("//")
        ? `https:${currentImage.url}`
        : currentImage.url;
      const downloadUrl = `${baseUrl}?fm=jpg&q=90`;
      const filename = `hamburg-gaa-${Date.now()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(uri);
      setDownloadState("saved");
      setTimeout(() => setDownloadState("idle"), 2000);
    } catch {
      setDownloadState("error");
      setTimeout(() => setDownloadState("idle"), 2000);
    }
  }, [images, currentIndex, downloadState]);

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
      setDownloadState("idle");
      onIndexChange?.(newIndex);
    },
    [width, onIndexChange],
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
          <StatusBar style="light" />
          <Pressable
            style={[styles.closeButton, { top: insets.top + 8 }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons
              name="close-circle"
              size={32}
              color={colors.textOnPrimary}
            />
          </Pressable>

          <Pressable
            style={[styles.downloadButton, { top: insets.top + 8 }]}
            onPress={handleDownload}
            disabled={downloadState === "downloading"}
            accessibilityRole="button"
            accessibilityLabel="Download image"
          >
            <Ionicons
              name={
                downloadState === "saved"
                  ? "checkmark-circle"
                  : downloadState === "error"
                    ? "alert-circle"
                    : "download-outline"
              }
              size={32}
              color={colors.textOnPrimary}
            />
          </Pressable>

          {onToggleLike ? (
            <LikeButton
              key={currentImageId}
              entry={likes?.[currentImageId]}
              onToggle={onToggleLike}
            />
          ) : null}

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
