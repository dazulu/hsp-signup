import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../i18n";
import { fetchGalleries } from "../services/contentful";
import type { Gallery } from "../services/contentful/types";

export const useGalleries = () => {
  const { locale } = useLocale();
  const cdaLocale = locale === "de" ? "de" : "en";

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const refresh = useCallback(
    async (force = false) => {
      if (fetchingRef.current) {
        return;
      }
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const data = await fetchGalleries(cdaLocale, force);
        setGalleries(data);
      } catch {
        setError("Failed to load galleries");
      } finally {
        fetchingRef.current = false;
        setLoading(false);
      }
    },
    [cdaLocale],
  );

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  const years = useMemo(
    () => [...new Set(galleries.map((g) => g.year))].sort((a, b) => b - a),
    [galleries],
  );

  const galleriesByYear = useMemo(() => {
    const map = new Map<number, Gallery[]>();
    for (const gallery of galleries) {
      const list = map.get(gallery.year) ?? [];
      list.push(gallery);
      map.set(gallery.year, list);
    }
    return map;
  }, [galleries]);

  return { galleries, years, galleriesByYear, loading, error, refresh };
};
