import { getStore } from "@netlify/blobs";
import type { Handler } from "@netlify/functions";

const STORE_NAME = "photo-likes";

type LikesBlob = Record<string, string[]>;

type LikeSummary = Record<string, { count: number; liked: boolean }>;

const MAX_FIELD_LENGTH = 64;
const MAX_LIKES_PER_IMAGE = 10_000;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Verify API key
  const apiKey = process.env.API_KEY;
  const provided = event.headers["x-api-key"];
  if (!apiKey || !provided || provided !== apiKey) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const store = getStore(STORE_NAME);

  // --- GET ---
  if (event.httpMethod === "GET") {
    const galleryId = event.queryStringParameters?.galleryId;
    const userId = event.queryStringParameters?.userId;

    if (
      !galleryId ||
      !userId ||
      galleryId.length > MAX_FIELD_LENGTH ||
      userId.length > MAX_FIELD_LENGTH
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing or invalid galleryId or userId",
        }),
      };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(summary),
    };
  }

  // --- POST ---
  if (event.httpMethod === "POST") {
    let galleryId: string;
    let imageId: string;
    let userId: string;
    let action: string;

    try {
      ({ galleryId, imageId, userId, action } = JSON.parse(event.body ?? ""));
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid JSON" }),
      };
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
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid request" }),
      };
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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        imageId,
        count: updatedUserIds.length,
        liked: action === "like",
      }),
    };
  }

  return { statusCode: 405, headers, body: "Method not allowed" };
};
