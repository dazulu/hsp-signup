# Project Guidelines

## Overview

Expo SDK 55 React Native app that books Hochschulsport Hamburg training sessions. Runs on Android (sideloaded APK), web (Netlify SPA), and has iOS config but no distribution yet.

See `ARCHITECTURE.md` for system overview, file structure, build commands, env vars, and design decisions.

> **Keep these docs current.** When making changes, update `AGENTS.md` and `ARCHITECTURE.md` to reflect them — briefly, no walls of text. Also keep `README.md` up to date — it's the user-facing introduction to the repo, so keep it high-level and light.

## Code Style

- **Formatter/Linter:** Biome — double quotes, 2-space indent, 80 char line width, trailing commas. Run `npm run check` before committing.
- **TypeScript:** `strict: true`, extends `expo/tsconfig.base` (bundler module resolution).
- **No path aliases** — use relative imports.
- **Naming:** Always use full, descriptive English names for variables, parameters, and functions. Never abbreviate — no single-letter names, no shortened forms (e.g. `error` not `e`, `year` not `y`, `event` not `evt`).
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).

## Component Patterns

- Functional components with hooks only. No class components.
- **Component declaration:** Use `export const` arrow functions, not `export function`. This applies everywhere — components, hooks, screens, and app entry points. No default exports — always use named exports.
- **Styles:** Always in a sibling `styles.ts` file (`StyleSheet.create`). The legacy central `src/styles.ts` exists but new components must colocate styles in their own `styles.ts`.
- **Design tokens:** All colours, radii, spacing, typography, and shadows live in `src/theme/index.ts`. Consume via the `theme` object: `import { theme } from "../theme"; const { colors, space } = theme;`. Never use raw hex strings or magic numbers in style files.
- **Types:** Always in a sibling `types.ts` file. Do not declare prop types inline in the component file.
- **Domain card components:** Cards that display remote data read from `MobileAppDataContext` via `useMobileAppData()` — they do not fetch independently. `NoticeCard` (accepts a `message` prop — callers source it from context), `UpcomingEventCard`, and `StravaCards` all follow this pattern. Only `LastBookingCard` reads from AsyncStorage locally. The screen mounts cards — no domain logic in the screen file.
- **Platform branching:** Prefer platform file extensions (`.native.tsx` / `.web.tsx`) over inline `Platform.OS` checks when the component tree diverges significantly. Use inline `Platform.OS` only for small one-line differences.
- **Platform file extension gotcha:** When using `.native.tsx` / `.web.tsx`, the barrel `index.tsx` must import from the extensionless name (`./my-component`, not `./my-component.web`). Do not create a generic `.tsx` fallback that re-exports a platform-specific file — Metro resolves `.native.tsx` first on native and `.web.tsx` first on web, but a generic file that hard-codes `.web` will poison the chain on Android/iOS.
- **Font family names:** `jakarta-400`, `jakarta-500`, `jakarta-600`, `jakarta-700`, `jakarta-800` (Plus Jakarta Sans loaded via `@expo-google-fonts`).
- **Primary colour:** `colors.primary` (`#4A6CF7`). See `src/theme/index.ts` for the full token set.
- **Border radius:** 14–16 for inputs/buttons, 24 for cards and sheets.
- **Valid sport keys:** `"hurling"` and `"football"` — the only accepted values throughout the app, Netlify functions, and Playwright script.

## State Management

- No external state library. React hooks + `useCallback`/`useEffect`/`useRef`.
- `useBooking` — booking state machine (idle → triggering → waiting → polling → success/failure/timeout).
- `useCredentials` — credential persistence. Native: opt-in SecureStore (user must enable "Remember login details" checkbox). Web: never stored — memory only.
- `MobileAppDataContext` (`src/context/mobile-app-data.tsx`) — global context providing `{ data, events, stravaData, loading, refresh, refreshContentful }`. Owns all remote data: Contentful `MOBILE_APP_DATA` entry, Contentful events, and Strava. `refresh(force?)` fetches all three and returns `Promise<void>` (used by pull-to-refresh). `refreshContentful()` fetches Contentful only and returns `Promise<void>` (used by `useFocusEffect` on screens). On web, `refresh()` skips events and Strava. No AsyncStorage cache on `data`; events and Strava use 1-hour TTL caches; `force=true` bypasses TTL but always writes fresh data back.
- `useGalleries` — independent gallery data hook (not in MobileAppDataContext). Fetches Contentful `gallery` entries with locale awareness (`de` when app is German, `en` otherwise). 1-hour TTL cache keyed by locale (`app_gallery_cache_en`, `app_gallery_cache_de`). Used only on the Photos and GalleryDetail screens.
- `AsyncStorage` for non-sensitive persistence (sport choice, triggered_at, correlationId, last booking, locale, strava cache, first-open flag).
- `expo-secure-store` for credentials on native, wrapped by `src/secure-store.ts` which provides a localStorage fallback on web.
- **AsyncStorage keys:** `app_save_on_device`, `hsp_sport`, `hsp_triggered_at`, `hsp_correlation_id`, `hsp_last_booking`, `app_strava_cache`, `app_contentful_events`, `app_gallery_cache_en`, `app_gallery_cache_de`, `app_has_opened_before`, `app_locale`. Keep `STORAGE_KEYS` in `src/screens/settings.tsx` in sync when adding new keys.

## i18n

- Custom React Context in `src/i18n/` — no external i18n library.
- Translations in `src/i18n/i18n.json`: flat key map, each key has `{ en, ga, de }`.
- `useLocale()` returns `{ locale, setLocale, t }`. Use `t("key")` for all user-facing strings.
- `TranslationKey` (derived from JSON keys) provides compile-time safety — typos are type errors.
- Web is locked to English (`locale = "en"` always). Native reads/writes `app_locale` in AsyncStorage.
- Language switcher lives in the Settings tab (native only) — a bottom-sheet modal.
- `formatTimeAgo` in `utils.ts` takes an optional `locale` param, defaults to `"en"`.
- Error boundary strings stay in English (class component, renders outside `LocaleProvider`).

## Serverless Functions

- Located in `netlify/functions/`. Written in TypeScript using `@netlify/functions`.
- Use Node.js `https` module directly (no axios/fetch libraries).
- All endpoints validate the `x-api-key` header against `process.env.API_KEY`.
- Input validation: reject invalid sport values, missing fields, and malformed JSON.
- `book.ts` encrypts HSP credentials with AES-256-GCM (`ENCRYPTION_KEY` env var) before passing them in `client_payload`. The workflow decrypts them and masks the plaintext immediately.

## Testing

- **Playwright e2e only** — no unit test framework is set up. The Playwright spec in `playwright/signup.spec.ts` runs in GitHub Actions, not locally.
- The Playwright test is triggered by `repository_dispatch` with credentials passed via `client_payload` as AES-256-GCM ciphertext. The workflow decrypts them using `ENCRYPTION_KEY` (GitHub secret) and immediately masks the plaintext with `::add-mask::` before writing to `GITHUB_ENV` for Playwright to consume.

## Security

Never log, hard-code, or commit secrets. HSP credentials exist only in transit — entered at runtime, encrypted by `book.ts` (AES-256-GCM) before being sent to GitHub, decrypted in the workflow, and never stored server-side.

**Exception:** Demo credentials (`DEMO_EMAIL` / `DEMO_PASSWORD` in `use-booking.ts`) are intentionally hardcoded for app store review. They do not grant access to any real HSP account — they trigger a fake local-only booking flow that never contacts the backend.

## Dependencies

- Stick to Expo-compatible packages. Use `npx expo install` for SDK-aligned native deps.
- Development uses Expo Go (`npm start`). Native modules not bundled in Expo Go require a full native rebuild (`npx expo prebuild` + `npx expo run:android`).
- Android APK/AAB production builds use EAS Build (`npm run release:preview` for APK, `npm run release:production` for AAB).
- OTA updates via EAS Update: `npm run ota:preview` / `npm run ota:production`. Uses `fingerprint` runtime version policy — JS-only changes don't need a rebuild.
- New Arch is enabled (`newArchEnabled: true`) for both iOS and Android.
