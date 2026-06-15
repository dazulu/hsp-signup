import type { NavigationContainerRef } from "@react-navigation/native";
import type { TabParamList } from "../../navigation/types";

export type WhatsNewSheetProps = {
  visible: boolean;
  onClose: () => void;
  navigationRef: React.RefObject<NavigationContainerRef<TabParamList> | null>;
};
