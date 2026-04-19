import { useEffect, useRef, useState } from "react";
import { fetchTrainingQuote } from "../services/contentful";
import type { TrainingQuote } from "../services/contentful/types";

// Module-level cache — avoids redundant AsyncStorage reads on remount
// (e.g. navigating away and back to TrainingInfo).
let quoteCache: TrainingQuote | null = null;
let cachePopulated = false;

export const useTrainingQuote = () => {
  const [quote, setQuote] = useState<TrainingQuote | null>(quoteCache);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (cachePopulated || fetchingRef.current) {
      return;
    }
    fetchingRef.current = true;

    // Null return means either "no quote in Contentful" or "fetch failed"
    // — both are treated as "nothing to show." This is intentional: the
    // quote card is optional UI, so distinguishing the two isn't needed.
    fetchTrainingQuote().then((result) => {
      quoteCache = result;
      cachePopulated = true;
      fetchingRef.current = false;
      setQuote(result);
    });
  }, []);

  return quote;
};
