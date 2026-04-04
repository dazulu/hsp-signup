import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../i18n";
import { fetchGalleries } from "../services/contentful";
import type { Gallery } from "../services/contentful/types";

// Module-level cache keyed by locale — so remounts (e.g. navigating from the Photos
// screen to GalleryDetail) read instantly without a second AsyncStorage round-trip.
const galleriesCache = new Map<string, Gallery[]>();

export const useGalleries = () => {
  const { locale } = useLocale();
  const cdaLocale = locale === "de" ? "de" : "en";

  const [galleries, setGalleries] = useState<Gallery[]>(
    () => galleriesCache.get(cdaLocale) ?? [],
  );
  const [loading, setLoading] = useState(() => !galleriesCache.has(cdaLocale));
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const refresh = useCallback(
    async (force = false) => {
      if (fetchingRef.current) {
        return;
      }
      fetchingRef.current = true;
      if (force || !galleriesCache.has(cdaLocale)) {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchGalleries(cdaLocale, force);
        galleriesCache.set(cdaLocale, data);
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
    () =>
      [...new Set(galleries.map((gallery) => gallery.year))].sort(
        (yearA, yearB) => yearB - yearA,
      ),
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
