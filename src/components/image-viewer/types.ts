import type { LikeEntry, LikesMap } from "../../hooks/use-likes";
import type { ContentfulImageInfo } from "../../services/contentful/types";

export type ImageViewerProps = {
  images: ContentfulImageInfo[];
  initialIndex: number;
  likes?: LikesMap;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  onToggleLike?: () => void;
  visible: boolean;
};

export type LikeButtonProps = {
  entry?: LikeEntry;
  onToggle: () => void;
};

export type ZoomableImageProps = {
  height: number;
  image: ContentfulImageInfo;
  onSwipeDown: () => void;
  width: number;
};
