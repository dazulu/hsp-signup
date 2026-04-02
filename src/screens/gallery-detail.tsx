import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Image } from "expo-image";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ImageViewer } from "../components/image-viewer";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { useGalleries } from "../hooks/use-galleries";
import { useLocale } from "../i18n";
import type { Locale } from "../i18n/types";
import type { TabParamList } from "../navigation/types";
import { placeholderUrl, thumbnailUrl } from "../services/contentful/images";
import type { ContentfulImageInfo } from "../services/contentful/types";
import { theme } from "../theme";
import { styles } from "./gallery-detail.styles";

const { space } = theme;
const NUM_COLUMNS = 3;
const GAP = space[4];
const PADDING = space[16];

const BCP47: Record<Locale, string> = {
  en: "en-IE",
  ga: "ga-IE",
  de: "de-DE",
};

const GalleryDetailScrollContent = ({ galleryId }: { galleryId: string }) => {
  const { headerHeight } = useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { galleries } = useGalleries();
  const { locale } = useLocale();
  const flatListRef = useRef<FlatList<ContentfulImageInfo>>(null);

  const gallery = useMemo(
    () => galleries.find((g) => g.id === galleryId),
    [galleries, galleryId],
  );

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const itemSize =
    (screenWidth - PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const onThumbnailPress = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ContentfulImageInfo; index: number }) => (
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
      </Pressable>
    ),
    [itemSize, onThumbnailPress],
  );

  const headerComponent = useMemo(() => {
    if (!gallery?.description && !gallery?.date) {
      return null;
    }
    const dateLabel = gallery.date
      ? new Date(gallery.date).toLocaleDateString(BCP47[locale], {
          year: "numeric",
          month: "long",
        })
      : null;
    return (
      <View style={styles.headerContainer}>
        {gallery.description ? (
          <Text style={styles.description}>{gallery.description}</Text>
        ) : null}
        {gallery.date ? <Text style={styles.date}>{dateLabel}</Text> : null}
      </View>
    );
  }, [gallery?.description, gallery?.date, locale]);

  if (!gallery) {
    return null;
  }

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={gallery.items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: bottom + space[12] },
        ]}
        scrollIndicatorInsets={{ top: headerHeight }}
        ListHeaderComponent={headerComponent}
      />
      <ImageViewer
        images={gallery.items}
        initialIndex={viewerIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </>
  );
};

export const GalleryDetailScreen = () => {
  const route = useRoute<RouteProp<TabParamList, "GalleryDetail">>();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { galleryId, galleryTitle } = route.params;

  return (
    <ScreenLayout
      title={galleryTitle}
      onBack={() => navigation.navigate("Photos")}
    >
      <GalleryDetailScrollContent galleryId={galleryId} />
    </ScreenLayout>
  );
};
