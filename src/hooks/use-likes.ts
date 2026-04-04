import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { getOrCreateUserId } from "../utils";

const API_URL =
  Platform.OS === "web" ? "" : (process.env.EXPO_PUBLIC_API_URL ?? "");
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";

export type LikeEntry = { count: number; liked: boolean };
export type LikesMap = Record<string, LikeEntry>;

// Module-level cache so remounts read likes instantly without waiting for network.
// Written imperatively (outside React state updaters) to avoid StrictMode double-invoke issues.
const likesCache = new Map<string, LikesMap>();

export const useLikes = (galleryId: string) => {
  const [likes, setLikes] = useState<LikesMap>(
    () => likesCache.get(galleryId) ?? {},
  );
  const [loading, setLoading] = useState(() => !likesCache.has(galleryId));
  const userIdRef = useRef<string | null>(null);

  // Write to both cache and React state — always called outside state updaters.
  const commitLikes = useCallback(
    (next: LikesMap) => {
      likesCache.set(galleryId, next);
      setLikes(next);
    },
    [galleryId],
  );

  useEffect(() => {
    getOrCreateUserId().then((id) => {
      userIdRef.current = id;
    });
  }, []);

  const fetchLikes = useCallback(async () => {
    const userId = userIdRef.current ?? (await getOrCreateUserId());
    userIdRef.current = userId;

    try {
      const url = `${API_URL}/api/likes?galleryId=${encodeURIComponent(galleryId)}&userId=${encodeURIComponent(userId)}`;
      const response = await fetch(url, {
        headers: { "x-api-key": API_KEY },
      });
      if (response.ok) {
        const data = (await response.json()) as LikesMap;
        const current = likesCache.get(galleryId) ?? {};
        if (JSON.stringify(current) !== JSON.stringify(data)) {
          commitLikes(data);
        }
      }
    } catch {
      // Network errors are silent — stale cache remains the UI source of truth.
    } finally {
      setLoading(false);
    }
  }, [galleryId, commitLikes]);

  useEffect(() => {
    // Skip network fetch if we already have cached data — cache is the source of
    // truth between remounts. Server sync happens only on explicit refresh().
    if (!likesCache.has(galleryId)) {
      fetchLikes();
    }
  }, [galleryId, fetchLikes]);

  const toggleLike = useCallback(
    async (imageId: string) => {
      const userId = userIdRef.current;
      if (!userId) {
        return;
      }

      // Read from cache — not from React state closure — to get the freshest value.
      const current = likesCache.get(galleryId) ?? {};
      const previous = current[imageId] ?? { count: 0, liked: false };
      const action = previous.liked ? "unlike" : "like";
      const optimistic: LikeEntry = {
        count: previous.liked
          ? Math.max(0, previous.count - 1)
          : previous.count + 1,
        liked: !previous.liked,
      };

      // Optimistic update — write to cache and state immediately.
      commitLikes({ ...current, [imageId]: optimistic });

      try {
        const response = await fetch(`${API_URL}/api/likes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
          body: JSON.stringify({ galleryId, imageId, userId, action }),
        });

        if (response.ok) {
          const data = (await response.json()) as {
            imageId: string;
            count: number;
            liked: boolean;
          };
          // Reconcile against latest cache in case multiple toggles happened.
          const latest = likesCache.get(galleryId) ?? {};
          commitLikes({
            ...latest,
            [data.imageId]: { count: data.count, liked: data.liked },
          });
        } else {
          const latest = likesCache.get(galleryId) ?? {};
          commitLikes({ ...latest, [imageId]: previous });
        }
      } catch {
        const latest = likesCache.get(galleryId) ?? {};
        commitLikes({ ...latest, [imageId]: previous });
      }
    },
    [galleryId, commitLikes],
  );

  return { likes, loading, toggleLike, refresh: fetchLikes };
};
