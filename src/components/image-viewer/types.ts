import type { ContentfulImageInfo } from "../../services/contentful/types";

export type ImageViewerProps = {
  images: ContentfulImageInfo[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
};
