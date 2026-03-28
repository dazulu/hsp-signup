# Architecture & Developer Notes

## How it works

1. **You** enter your HSP credentials and pick a sport (Hurling & Camogie or Gaelic Football)
2. **The app** sends a request to a Netlify function, which triggers a GitHub Actions workflow
3. **The workflow** runs a Playwright script that navigates the HSP website, logs in, and completes the booking on your behalf
4. **The app** polls a second Netlify function to check the workflow result
5. **You** get a confirmation email directly from Hochschulsport Hamburg

## Code structure

```
src/
  App.tsx                      Root component (render only)
  styles.ts                    App-shell styles (flex, gradient) — not for component use
  theme/index.ts               Design tokens: colours, radii, spacing, typography, shadows
  secure-store.ts              SecureStore/localStorage abstraction
  utils.ts                     formatTimeAgo helper
  hooks/
    use-booking.ts             Booking state machine, effects, callbacks
    use-credentials.ts         Email/password state, opt-in SecureStore persistence (native only)
  components/
    debug-panel.tsx            Dev-only debug panel (hidden in production builds)
netlify/functions/
  book.ts                      Triggers GitHub Actions repository_dispatch
  status.ts                    Queries workflow run result via correlationId
playwright/
  signup.spec.ts               Browser automation script (runs in GitHub Actions only)
```

## Architecture

```
Expo App (React Native / Web)
  → Netlify Function (/api/book)
  |   → GitHub Actions (repository_dispatch)
  |       → Playwright script (playwright/signup.spec.ts)
  |           → HSP website booking
  → Netlify Function (/api/status?correlationId=…)
      → GitHub Actions API (list workflow runs)
```

The app is built with Expo and runs as both a native Android app and a web app served from the same Netlify site that hosts the serverless functions. The web bundle is produced by `expo export --platform web` at build time (Metro SPA output → `dist/`).

The app doesn't talk to the HSP website directly. It calls a Netlify serverless function that triggers a GitHub Actions workflow via `repository_dispatch`. The workflow runs a Playwright browser automation script that handles the actual multi-page signup flow.

## Running locally

```bash
npm start          # Expo dev server — opens in Expo Go on device/simulator
npm run web        # Expo dev server, web only
npm run build:web  # Production web export → dist/
npx netlify dev    # Full local stack: web app + functions at localhost:8888
```

For `netlify dev`, open `http://localhost:8888` (not the Metro port 8081). The Netlify proxy routes `/api/*` to the local functions and everything else to Metro.

Android APK/AAB production builds use EAS Build:
```bash
eas build --profile preview     # APK (sideload)
eas build --profile production  # AAB
```

## Environment variables

| Where | Variable | Purpose |
|-------|----------|---------|
| `.env` (Expo) | `EXPO_PUBLIC_API_URL` | Base URL of the Netlify site, used by native builds only (web uses relative URLs) |
| `.env` (Expo) | `EXPO_PUBLIC_API_KEY` | Shared secret to authenticate app requests to Netlify |
| Netlify | `API_KEY` | Same shared secret (server side) |
| Netlify | `GITHUB_PAT` | GitHub personal access token to trigger and query workflows |

HSP login credentials are not env vars — they are entered by the user at runtime and passed through the Netlify function to the GitHub Actions workflow via `client_payload`. They are never stored on any server and are masked in workflow logs via `::add-mask::`.

Credentials are stored on-device using Expo SecureStore (native) only when the user enables "Remember login details on this device". On web, credentials are **never** stored — they live in React state for the duration of the session only. The `secure-store.ts` wrapper abstracts the platform difference.

## Design decisions

**Native credential storage is opt-in.** On native, credentials are only written to Expo SecureStore if the user explicitly checks "Remember login details on this device". Unchecking the box immediately removes any stored credentials. On web, credentials are never persisted — memory only.

**50-second countdown then status polling.** After triggering a booking, the app shows a 50-second progress bar (the time the workflow typically takes to complete). Once the countdown finishes it switches to a polling phase: it calls `/api/status` every 10 seconds (up to 10 attempts) to check the GitHub Actions workflow result via the `correlationId`. On success or failure it shows the result; if all polls are exhausted it shows a timeout state with a "Check Again" button to resume polling.

**`correlationId` for workflow matching.** Each booking generates a UUID that is passed through as the workflow run name. The status function searches recent `repository_dispatch` workflow runs for one whose name contains the correlationId, allowing the correct run to be identified even when multiple users trigger concurrently.

**Timer and correlation state persists across restarts.** `triggered_at` and `correlation_id` are stored in AsyncStorage. On app launch, if a booking was triggered recently and is still within the countdown/polling window, the app resumes the correct state rather than losing progress.

**Web uses relative API URLs.** On web the app is served from the same origin as the Netlify functions, so `fetch("/api/book")` works without setting `EXPO_PUBLIC_API_URL`. Native builds still need the full URL.
