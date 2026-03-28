# Project Guidelines

## Overview

Expo SDK 55 React Native app that books Hochschulsport Hamburg training sessions. Runs on Android (sideloaded APK), web (Netlify SPA), and has iOS config but no distribution yet.

See `ARCHITECTURE.md` for system overview, file structure, build commands, env vars, and design decisions.

> **Keep these docs current.** When making changes, update `AGENTS.md` and `ARCHITECTURE.md` to reflect them — briefly, no walls of text.

## Code Style

- **Formatter/Linter:** Biome — double quotes, 2-space indent, 80 char line width, trailing commas. Run `npm run check` before committing.
- **TypeScript:** `strict: true`, extends `expo/tsconfig.base` (bundler module resolution).
- **No path aliases** — use relative imports.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).

## Component Patterns

- Functional components with hooks only. No class components.
- **Component declaration:** Use `export const` arrow functions, not `export function`. This applies everywhere — components, hooks, screens, and app entry points. No default exports — always use named exports.
- **Styles:** Always in a sibling `styles.ts` file (`StyleSheet.create`). The legacy central `src/styles.ts` exists but new components must colocate styles in their own `styles.ts`.
- **Design tokens:** All colours, radii, spacing, typography, and shadows live in `src/theme/index.ts`. Consume via the `theme` object: `import { theme } from "../theme"; const { colors, space } = theme;`. Never use raw hex strings or magic numbers in style files.
- **Types:** Always in a sibling `types.ts` file. Do not declare prop types inline in the component file.
- **Domain card components:** When a card in a screen has its own data-fetching or business logic, extract it into a dedicated component under `src/components/card/implementations/<name>/` (e.g. `last-booking/`). The component owns its own data and renders a `<Card>` internally. The screen only mounts it — no domain logic in the screen file.
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

## Security

Never log, hard-code, or commit secrets. HSP credentials exist only in transit — entered at runtime, passed via `client_payload`, never stored server-side.

## Dependencies

- Stick to Expo-compatible packages. Use `npx expo install` for SDK-aligned native deps.
- Development uses Expo Go (`npm start`). Native modules not bundled in Expo Go require a full native rebuild (`npx expo prebuild` + `npx expo run:android`).
- Android APK/AAB production builds use EAS Build (`eas build --profile preview` for APK, `eas build --profile production` for AAB).
- New Arch is enabled (`newArchEnabled: true`) for both iOS and Android.
