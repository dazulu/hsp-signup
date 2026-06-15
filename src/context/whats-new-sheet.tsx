import { createContext, useContext } from "react";

type WhatsNewSheetContextValue = {
  open: () => void;
  markSeen: () => void;
};

export const WhatsNewSheetContext = createContext<WhatsNewSheetContextValue>({
  open: () => {},
  markSeen: () => {},
});

export const useWhatsNewSheet = () => useContext(WhatsNewSheetContext);
