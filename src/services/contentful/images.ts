import { PixelRatio } from "react-native";

type ImageParams = {
  w?: number;
  h?: number;
  fit?: "pad" | "fill" | "scale" | "crop" | "thumb";
  f?: "center" | "faces" | "top" | "bottom" | "left" | "right";
  fm?: "webp" | "jpg" | "png" | "avif";
  q?: number;
  fl?: "progressive";
};

const pixelScale = Math.min(PixelRatio.get(), 3);

const buildUrl = (baseUrl: string, params: ImageParams): string => {
  const url = baseUrl.startsWith("//") ? `https:${baseUrl}` : baseUrl;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  }
  return `${url}?${query.toString()}`;
};

export const contentfulImageUrl = (
  baseUrl: string,
  params: ImageParams,
): string => buildUrl(baseUrl, params);

export const coverCardUrl = (url: string, screenWidth: number): string =>
  buildUrl(url, {
    w: Math.round(screenWidth * pixelScale),
    h: Math.round(screenWidth * 0.6 * pixelScale),
    fit: "fill",
    f: "faces",
    fm: "webp",
    q: 80,
  });

export const thumbnailUrl = (url: string, size: number): string =>
  buildUrl(url, {
    w: Math.round(size * pixelScale),
    h: Math.round(size * pixelScale),
    fit: "fill",
    f: "center",
    fm: "webp",
    q: 75,
  });

export const fullImageUrl = (url: string, maxWidth: number): string =>
  buildUrl(url, {
    w: Math.round(maxWidth * pixelScale),
    fit: "pad",
    fm: "webp",
    q: 85,
  });

export const placeholderUrl = (url: string): string =>
  buildUrl(url, {
    w: 20,
    fm: "webp",
    q: 30,
  });
