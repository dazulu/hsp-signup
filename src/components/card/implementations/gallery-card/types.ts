import type { Gallery } from "../../../../services/contentful/types";

export type GalleryCardProps = {
  gallery: Gallery;
  screenWidth: number;
  onPress: (gallery: Gallery) => void;
};
