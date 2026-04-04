import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GalleryCard } from "../components/card/implementations/gallery-card";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { YearSidebar } from "../components/year-sidebar";
import { useGalleries } from "../hooks/use-galleries";
import { useLocale } from "../i18n";
import type { PhotosStackParamList } from "../navigation/types";
import type { Gallery } from "../services/contentful/types";
import { theme } from "../theme";
import { styles } from "./photos.styles";

const { space } = theme;

const PhotosScrollContent = () => {
  const { headerHeight } = useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useLocale();
  const navigation =
    useNavigation<NativeStackNavigationProp<PhotosStackParamList>>();
  const { galleries, years, loading, error, refresh } = useGalleries();
  const flatListRef = useRef<FlatList<Gallery>>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeYear, setActiveYear] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      };
    }, []),
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    refresh(true).finally(() => setIsRefreshing(false));
  }, [refresh]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ item: Gallery }> }) => {
      if (viewableItems.length > 0) {
        const middleIndex = Math.floor(viewableItems.length / 2);
        const centralItem = viewableItems[middleIndex];
        if (centralItem) {
          setActiveYear(centralItem.item.year);
        }
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onGalleryPress = useCallback(
    (gallery: Gallery) => {
      navigation.navigate("GalleryDetail", {
        galleryId: gallery.id,
        galleryTitle: gallery.title,
      });
    },
    [navigation],
  );

  const onYearPress = useCallback(
    (year: number) => {
      const index = galleries.findIndex((g) => g.year === year);
      if (index >= 0 && flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0,
        });
      }
    },
    [galleries],
  );

  const renderItem = useCallback(
    ({ item }: { item: Gallery }) => (
      <GalleryCard
        gallery={item}
        screenWidth={screenWidth - space[16] * 2}
        onPress={onGalleryPress}
      />
    ),
    [screenWidth, onGalleryPress],
  );

  const emptyComponent = loading ? null : (
    <View style={styles.emptyContainer}>
      <Text style={error ? styles.errorText : styles.emptyText}>
        {error ? t("photos.error") : t("photos.empty")}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={galleries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottom + space[12] },
        ]}
        scrollIndicatorInsets={{ top: headerHeight }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListEmptyComponent={emptyComponent}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
      />
      <YearSidebar
        years={years}
        activeYear={activeYear}
        onYearPress={onYearPress}
      />
    </View>
  );
};

export const PhotosScreen = () => {
  const { t } = useLocale();

  return (
    <ScreenLayout title={t("photos.title")}>
      <PhotosScrollContent />
    </ScreenLayout>
  );
};
