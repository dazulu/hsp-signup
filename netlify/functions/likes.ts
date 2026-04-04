import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

const STORE_NAME = "photo-likes";

type LikesBlob = Record<string, string[]>;

type LikeSummary = Record<string, { count: number; liked: boolean }>;

const MAX_FIELD_LENGTH = 64;
const MAX_LIKES_PER_IMAGE = 10_000;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response("", { status: 204, headers: corsHeaders });
  }

  // Verify API key
  const apiKey = process.env.API_KEY;
  const provided = request.headers.get("x-api-key");
  if (!apiKey || !provided || provided !== apiKey) {
    return json({ error: "Unauthorized" }, 401);
  }

  const store = getStore(STORE_NAME);

  // --- GET ---
  if (request.method === "GET") {
    const url = new URL(request.url);
    const galleryId = url.searchParams.get("galleryId");
    const userId = url.searchParams.get("userId");

    if (
      !galleryId ||
      !userId ||
      galleryId.length > MAX_FIELD_LENGTH ||
      userId.length > MAX_FIELD_LENGTH
    ) {
      return json({ error: "Missing or invalid galleryId or userId" }, 400);
    }

    let blob: LikesBlob = {};
    try {
      const raw = await store.get(`gallery:${galleryId}`, { type: "json" });
      if (raw) {
        blob = raw as LikesBlob;
      }
    } catch {
      // No blob yet — return empty summary
    }

    const summary: LikeSummary = {};
    for (const [imageId, userIds] of Object.entries(blob)) {
      summary[imageId] = {
        count: userIds.length,
        liked: userIds.includes(userId),
      };
    }

    return json(summary);
  }

  // --- POST ---
  if (request.method === "POST") {
    let galleryId: string;
    let imageId: string;
    let userId: string;
    let action: string;

    try {
      ({ galleryId, imageId, userId, action } = await request.json());
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    if (
      typeof galleryId !== "string" ||
      typeof imageId !== "string" ||
      typeof userId !== "string" ||
      typeof action !== "string" ||
      !galleryId ||
      !imageId ||
      !userId ||
      !["like", "unlike"].includes(action) ||
      galleryId.length > MAX_FIELD_LENGTH ||
      imageId.length > MAX_FIELD_LENGTH ||
      userId.length > MAX_FIELD_LENGTH
    ) {
      return json({ error: "Invalid request" }, 400);
    }

    let blob: LikesBlob = {};
    try {
      const raw = await store.get(`gallery:${galleryId}`, { type: "json" });
      if (raw) {
        blob = raw as LikesBlob;
      }
    } catch {
      // No blob yet — start fresh
    }

    const existingUserIds: string[] = blob[imageId] ?? [];

    if (action === "like") {
      if (
        !existingUserIds.includes(userId) &&
        existingUserIds.length < MAX_LIKES_PER_IMAGE
      ) {
        blob[imageId] = [...existingUserIds, userId];
      }
    } else {
      blob[imageId] = existingUserIds.filter(
        (existingUserId) => existingUserId !== userId,
      );
    }

    await store.setJSON(`gallery:${galleryId}`, blob);

    const updatedUserIds = blob[imageId] ?? [];
    return json({
      imageId,
      count: updatedUserIds.length,
      liked: action === "like",
    });
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: corsHeaders,
  });
};
