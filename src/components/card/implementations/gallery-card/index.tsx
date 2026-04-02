import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text } from "react-native";
import { useLocale } from "../../../../i18n";
import {
  coverCardUrl,
  placeholderUrl,
} from "../../../../services/contentful/images";
import { styles } from "./styles";
import type { GalleryCardProps } from "./types";

const IMAGE_ASPECT = 0.6;

export const GalleryCard = ({
  gallery,
  screenWidth,
  onPress,
}: GalleryCardProps) => {
  const { t, locale } = useLocale();
  const imageHeight = screenWidth * IMAGE_ASPECT;
  const photoLabel =
    gallery.items.length === 1 ? t("gallery.photo") : t("gallery.photos");
  const date = new Date(gallery.date).toLocaleString(locale, {
    month: "long",
    year: "numeric",
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.92 : 1 }]}
      onPress={() => onPress(gallery)}
      accessibilityRole="button"
      accessibilityLabel={`${gallery.title}, ${date}`}
    >
      <Image
        source={{ uri: coverCardUrl(gallery.cover.url, screenWidth) }}
        placeholder={{ uri: placeholderUrl(gallery.cover.url) }}
        style={[styles.image, { height: imageHeight }]}
        contentFit="cover"
        placeholderContentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.65)"]}
        style={styles.overlay}
      >
        <Text style={styles.title}>{gallery.title}</Text>
        <Text style={styles.year}>
          {date} · {gallery.items.length} {photoLabel}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};
