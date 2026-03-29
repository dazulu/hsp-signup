import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { fetchMobileAppData } from "../services/contentful";
import type { MobileAppData } from "../services/contentful/types";

type MobileAppDataContextValue = {
  data: MobileAppData | null;
  loading: boolean;
  refresh: () => void;
};

const MobileAppDataContext = createContext<
  MobileAppDataContextValue | undefined
>(undefined);

export const MobileAppDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<MobileAppData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchingRef = useRef(false);

  const refresh = useCallback(() => {
    if (fetchingRef.current) {
      return;
    }
    fetchingRef.current = true;
    setLoading(true);
    fetchMobileAppData()
      .then(setData)
      .finally(() => {
        fetchingRef.current = false;
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <MobileAppDataContext.Provider value={{ data, loading, refresh }}>
      {children}
    </MobileAppDataContext.Provider>
  );
};

export const useMobileAppData = (): MobileAppDataContextValue => {
  const ctx = useContext(MobileAppDataContext);
  if (!ctx) {
    throw new Error(
      "useMobileAppData must be used within MobileAppDataProvider",
    );
  }
  return ctx;
};
