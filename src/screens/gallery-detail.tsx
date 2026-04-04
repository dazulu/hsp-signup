import { Ionicons } from "@expo/vector-icons";
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ImageViewer } from "../components/image-viewer";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { useGalleries } from "../hooks/use-galleries";
import { useLikes } from "../hooks/use-likes";
import { useLocale } from "../i18n";
import type { Locale } from "../i18n/types";
import type { PhotosStackParamList } from "../navigation/types";
import { placeholderUrl, thumbnailUrl } from "../services/contentful/images";
import type { ContentfulImageInfo } from "../services/contentful/types";
import { theme } from "../theme";
import { styles } from "./gallery-detail.styles";

const { colors, space } = theme;
const NUM_COLUMNS = 3;
const GAP = space[4];
const PADDING = space[16];

const BCP47: Record<Locale, string> = {
  en: "en-IE",
  ga: "ga-IE",
  de: "de-DE",
};

const GalleryDetailScrollContent = ({
  galleryId,
  galleryTitle,
}: {
  galleryId: string;
  galleryTitle: string;
}) => {
  const { headerHeight } = useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { galleries, refresh: galleryRefresh } = useGalleries();
  const {
    likes,
    loading: likesLoading,
    toggleLike,
    refresh: likesRefresh,
  } = useLikes(galleryId);
  const { locale } = useLocale();
  const [refreshing, setRefreshing] = useState(false);

  const gallery = useMemo(
    () => galleries.find((g) => g.id === galleryId),
    [galleries, galleryId],
  );

  const sortedItems = useMemo(() => {
    if (!gallery) {
      return [];
    }
    return [...gallery.items].sort(
      (itemA, itemB) =>
        (likes[itemB.id]?.count ?? 0) - (likes[itemA.id]?.count ?? 0),
    );
  }, [gallery, likes]);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const viewerCurrentIndexRef = useRef(0);

  const itemSize =
    (screenWidth - PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const onThumbnailPress = useCallback(
    (index: number) => {
      const tappedItem = sortedItems[index];
      const originalIndex =
        gallery?.items.findIndex((item) => item.id === tappedItem?.id) ?? 0;
      viewerCurrentIndexRef.current = originalIndex;
      setViewerIndex(originalIndex);
      setViewerVisible(true);
    },
    [sortedItems, gallery],
  );

  const handleViewerIndexChange = useCallback((index: number) => {
    viewerCurrentIndexRef.current = index;
  }, []);

  const handleToggleLike = useCallback(() => {
    const image = gallery?.items[viewerCurrentIndexRef.current];
    if (image) {
      toggleLike(image.id);
    }
  }, [gallery, toggleLike]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([galleryRefresh(true), likesRefresh()]);
    setRefreshing(false);
  }, [galleryRefresh, likesRefresh]);

  const renderItem = useCallback(
    ({ item, index }: { item: ContentfulImageInfo; index: number }) => {
      const likeEntry = likes[item.id];
      const likeCount = likeEntry?.count ?? 0;
      return (
        <Pressable
          onPress={() => onThumbnailPress(index)}
          style={({ pressed }) => [
            styles.thumbnail,
            { width: itemSize, height: itemSize, opacity: pressed ? 0.8 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          <Image
            source={{ uri: thumbnailUrl(item.url, itemSize) }}
            placeholder={{ uri: placeholderUrl(item.url) }}
            style={{ width: itemSize, height: itemSize }}
            contentFit="cover"
            placeholderContentFit="cover"
            transition={200}
          />
          {likeCount > 0 ? (
            <View style={styles.likeOverlay}>
              <Ionicons name="heart" size={14} color={colors.like} />
              <Text style={styles.likeOverlayText}>{likeCount}</Text>
            </View>
          ) : null}
        </Pressable>
      );
    },
    [itemSize, likes, onThumbnailPress],
  );

  const headerComponent = useMemo(() => {
    const dateLabel = gallery?.date
      ? new Date(gallery.date).toLocaleDateString(BCP47[locale], {
          year: "numeric",
          month: "long",
        })
      : null;
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.galleryTitle}>{galleryTitle}</Text>
        {gallery?.description ? (
          <Text style={styles.description}>{gallery.description}</Text>
        ) : null}
        {gallery?.date ? <Text style={styles.date}>{dateLabel}</Text> : null}
      </View>
    );
  }, [gallery?.description, gallery?.date, galleryTitle, locale]);

  if (!gallery || likesLoading) {
    return null;
  }

  return (
    <>
      <FlatList
        data={sortedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: bottom + space[12] },
        ]}
        scrollIndicatorInsets={{ top: headerHeight }}
        ListHeaderComponent={headerComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <ImageViewer
        images={gallery.items}
        initialIndex={viewerIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        likes={likes}
        onIndexChange={handleViewerIndexChange}
        onToggleLike={handleToggleLike}
      />
    </>
  );
};

export const GalleryDetailScreen = () => {
  const route = useRoute<RouteProp<PhotosStackParamList, "GalleryDetail">>();
  const navigation =
    useNavigation<NativeStackNavigationProp<PhotosStackParamList>>();
  const { galleryId, galleryTitle } = route.params;
  const { t } = useLocale();

  return (
    <ScreenLayout title={t("photos.title")} onBack={() => navigation.goBack()}>
      <GalleryDetailScrollContent
        galleryId={galleryId}
        galleryTitle={galleryTitle}
      />
    </ScreenLayout>
  );
};
