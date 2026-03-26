# Project Guidelines

## Overview

Expo SDK 55 React Native app that books Hochschulsport Hamburg training sessions. Single-screen app today, may add navigation later. Runs on Android (sideloaded APK), web (Netlify SPA), and has iOS config but no distribution yet.

## Architecture

```
Expo App (React Native + Web)
  → Netlify Function /api/book     → GitHub Actions repository_dispatch
                                       → Playwright browser automation → HSP website
  → Netlify Function /api/status   → GitHub Actions API (poll by correlationId)
```

- App sends credentials + sport to `/api/book` Netlify function
- Function triggers a GitHub Actions workflow via `repository_dispatch`
- Workflow runs `playwright/signup.spec.ts` to automate the HSP booking
- App polls `/api/status` with a `correlationId` UUID to check the result
- Credentials pass through `client_payload` and are never stored server-side

Key files: see `ARCHITECTURE.md` for the full breakdown.

## Code Style

- **Formatter/Linter:** Biome — double quotes, 2-space indent, 80 char line width, trailing commas. Run `npm run check` before committing.
- **TypeScript:** `strict: true`, extends `expo/tsconfig.base` (bundler module resolution).
- **No path aliases** — use relative imports.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).

## Component Patterns

- Functional components with hooks only. No class components.
- **Styles:** Per-component `StyleSheet.create` in the same file is fine. The legacy central `src/styles.ts` exists but new components should colocate styles.
- **Platform branching:** Prefer platform file extensions (`.native.tsx` / `.web.tsx`) over inline `Platform.OS` checks when the component tree diverges significantly. Use inline `Platform.OS` only for small one-line differences.
- **Platform file extension gotcha:** When using `.native.tsx` / `.web.tsx`, the barrel `index.tsx` must import from the extensionless name (`./my-component`, not `./my-component.web`). Do not create a generic `.tsx` fallback that re-exports a platform-specific file — Metro resolves `.native.tsx` first on native and `.web.tsx` first on web, but a generic file that hard-codes `.web` will poison the chain on Android/iOS.
- **Font family names:** `jakarta-400`, `jakarta-500`, `jakarta-600`, `jakarta-700`, `jakarta-800` (Plus Jakarta Sans loaded via `@expo-google-fonts`).
- **Primary colour:** `#4A6CF7`. Card background: `#fff`. Text: `#1a1f36`. Muted text: `#6b7a99`.
- **Border radius:** 14–16 for inputs/buttons, 24 for cards and sheets.
- **Valid sport keys:** `"hurling"` and `"football"` — the only accepted values throughout the app, Netlify functions, and Playwright script.

## State Management

- No external state library. React hooks + `useCallback`/`useEffect`/`useRef`.
- `useBooking` — booking state machine (idle → triggering → waiting → polling → success/failure/timeout).
- `useCredentials` — credential persistence (SecureStore on native, opt-in localStorage on web).
- `AsyncStorage` for non-sensitive persistence (sport choice, triggered_at, correlationId, last booking).
- `expo-secure-store` for credentials on native, wrapped by `src/secure-store.ts` which provides a localStorage fallback on web.

## Serverless Functions

- Located in `netlify/functions/`. Written in TypeScript using `@netlify/functions`.
- Use Node.js `https` module directly (no axios/fetch libraries).
- All endpoints validate the `x-api-key` header against `process.env.API_KEY`.
- Input validation: reject invalid sport values, missing fields, and malformed JSON.

## Testing

- **Playwright e2e only** — no unit test framework is set up. The Playwright spec in `playwright/signup.spec.ts` runs in GitHub Actions, not locally.
- The Playwright test is triggered by `repository_dispatch` with credentials passed via `client_payload` and masked in workflow logs.

## Environment Variables

| Where | Variable | Purpose |
|-------|----------|---------|
| `.env` | `EXPO_PUBLIC_API_URL` | Base URL for native builds (web uses relative URLs) |
| `.env` | `EXPO_PUBLIC_API_KEY` | Shared secret for app → Netlify auth |
| Netlify | `API_KEY` | Same shared secret (server side) |
| Netlify | `GITHUB_PAT` | GitHub PAT for triggering/querying workflows |

HSP login credentials are not env vars — they are entered by the user at runtime and passed through the Netlify function to GitHub Actions via `client_payload`. They are never stored on any server and are masked in workflow logs.

Never log, hard-code, or commit secrets. Credentials exist only in transit.

## Build & Run

```bash
npm start              # Expo dev server — opens in Expo Go on device/simulator
npm run web            # Expo dev server, web only
npm run build:web      # Production web export → dist/
npx netlify dev        # Full local stack (app + functions) at localhost:8888
npm run lint           # Biome lint
npm run format         # Biome format
npm run check          # Biome check (lint + format)
```

For `npx netlify dev`, open `http://localhost:8888` (not Metro's port 8081). The Netlify proxy routes `/api/*` to local functions and everything else to Metro.

## Dependencies

- Stick to Expo-compatible packages. Use `npx expo install` for SDK-aligned native deps.
- Development uses Expo Go (`npm start`). Native modules not bundled in Expo Go require a full native rebuild (`npx expo prebuild` + `npx expo run:android`).
- Android APK/AAB production builds use EAS Build (`eas build --profile preview` for APK, `eas build --profile production` for AAB).
- New Arch is enabled (`newArchEnabled: true`) for both iOS and Android.
