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
  App.tsx                      Root component (web)
  App.native.tsx               Native root with bottom tab navigator
  styles.ts                    App-shell styles (flex, gradient) — not for component use
  theme/index.ts               Design tokens: colours, radii, spacing, typography, shadows
  secure-store.ts              SecureStore/localStorage abstraction
  utils.ts                     formatTimeAgo helper (locale-aware), getOrCreateUserId (SecureStore UUID)
  i18n/
    i18n.json                  All translatable strings: { key: { en, ga, de } }
    index.tsx                  LocaleContext, LocaleProvider, useLocale() hook
    types.ts                   Locale union type, TranslationKey, LOCALE_LABELS
  hooks/
    use-booking.ts             Booking state machine, effects, callbacks
    use-credentials.ts         Email/password state, opt-in SecureStore persistence (native only)
    use-galleries.ts           Gallery data hook (fetches + caches Contentful galleries, locale-aware)
    use-likes.ts               Per-gallery photo likes (fetches + toggles via /api/likes, optimistic UI)
    use-last-booking-label.ts  Formatted label for last successful booking
    use-welcome-text/          Locale-aware greeting pool
  context/
    mobile-app-data.tsx        MobileAppDataContext — owns all remote data: Contentful notices, events, Strava
  navigation/
    types.ts                   Navigation param list types
  components/
    booking/                   Booking flow UI (form, progress, result)
    card/
      card.tsx                 Generic Card shell (supports optional tooltipText for inline tooltip)
      card-grid.tsx            Responsive card grid layout
      implementations/
        club-links/            External link cards (website, socials)
        last-booking/          Last booking info card (self-fetching)
        notice/                General notice card (reads data.notice from MobileAppDataContext)
        strava-cards/          Strava activity cards (reads stravaData from MobileAppDataContext)
        training-notice/       Booking notice card (reads data.booking.notice from MobileAppDataContext)
        upcoming-event/        Next training session card (reads events from MobileAppDataContext)
        gallery-card/          Cover image card for photo galleries
    error-boundary.tsx         Top-level error boundary
    image-viewer/              Full-screen image viewer with pinch-zoom, horizontal paging, and like button
    language-switcher/         Bottom-sheet language picker (native only)
    modal/                     TooltipModal — info icon + fade-in centred modal (statusBarTranslucent, onShow-driven animation)
    screen-layout/             Floating header layout: gradient + safe-area, subtitle fade-on-scroll, scroll context
    year-sidebar/              Year navigation sidebar for the photos screen
  screens/
    book.tsx                   Book a training session
    club.tsx                   Club info & links
    photos.tsx                 Photo gallery — gallery list with year sidebar
    gallery-detail.tsx         Thumbnail grid for a single gallery (sorted by likes, pull-to-refresh)
    settings.tsx               Settings — language switcher + version card
    upcoming-events.tsx        Upcoming training sessions list
  services/
    contentful/                Generic Contentful CDA client (types + fetcher + 1h event/gallery cache)
      images.ts                Contentful Images API URL builder (cover, thumbnail, full, placeholder)
    strava/                    Strava fetch + 1h AsyncStorage cache (`fetchStravaData(force?)`)
netlify/functions/
  book.ts                      Triggers GitHub Actions repository_dispatch
  status.ts                    Queries workflow run result via correlationId
  strava.ts                    Strava activity proxy
  likes.ts                     Photo like storage (Netlify Blobs — per-gallery read/write)
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

## Environment variables

### Expo app (`.env`)

| Variable | Used in | Purpose |
|----------|---------|---------|
| `EXPO_PUBLIC_API_URL` | `use-booking.ts`, `use-likes.ts`, `src/services/strava/index.ts` | Base URL of the Netlify site — native only; web uses relative URLs |
| `EXPO_PUBLIC_API_KEY` | `use-booking.ts`, `use-likes.ts`, `src/services/strava/index.ts` | Shared secret sent as `x-api-key` header on Netlify function requests |
| `EXPO_PUBLIC_CONTENTFUL_SPACE_ID` | `src/services/contentful/index.ts` | Contentful space ID for CDA requests (public/read-only) |
| `EXPO_PUBLIC_CONTENTFUL_ACCESS_TOKEN` | `src/services/contentful/index.ts` | Contentful CDA delivery access token (public/read-only) |

### Netlify environment variables

| Variable | Used in | Purpose |
|----------|---------|---------|
| `API_KEY` | `book.ts`, `status.ts`, `strava.ts`, `likes.ts` | Server-side of the shared `x-api-key` secret — must match `EXPO_PUBLIC_API_KEY` |
| `GITHUB_PAT` | `book.ts`, `status.ts` | GitHub PAT with `repo` scope — triggers `repository_dispatch` and reads workflow runs |
| `ENCRYPTION_KEY` | `book.ts` | 64-char hex string (32-byte AES-256-GCM key) — encrypts HSP credentials before they are placed in `client_payload` |
| `STRAVA_CLIENT_ID` | `strava.ts` | Strava API OAuth client ID |
| `STRAVA_CLIENT_SECRET` | `strava.ts` | Strava API OAuth client secret |
| `STRAVA_REFRESH_TOKEN` | `strava.ts` | Long-lived Strava refresh token for the club account |
| `STRAVA_CLUB_ID` | `strava.ts` | Numeric Strava club ID for activity queries |

### GitHub Actions secrets

| Secret | Used in | Purpose |
|--------|---------|---------|
| `ENCRYPTION_KEY` | `playwright.yml` decrypt step | Same 64-char hex value as Netlify — decrypts credentials before Playwright runs |

HSP login credentials are not env vars — they are entered by the user at runtime. `book.ts` encrypts them with AES-256-GCM before putting them in `client_payload`. What GitHub stores and displays in the UI is ciphertext. The workflow decrypts using `ENCRYPTION_KEY` (GitHub secret), immediately masks the plaintext values with `::add-mask::`, then writes them to `GITHUB_ENV` for Playwright to consume. Credentials are never stored on any server.

Credentials are stored on-device using Expo SecureStore (native) only when the user enables "Remember login details on this device". On web, credentials are **never** stored — they live in React state for the duration of the session only. The `secure-store.ts` wrapper abstracts the platform difference.

## Design decisions

**Native credential storage is opt-in.** On native, credentials are only written to Expo SecureStore if the user explicitly checks "Remember login details on this device". Unchecking the box immediately removes any stored credentials. On web, credentials are never persisted — memory only.

**`ScreenLayout` floats over scrollable content.** The header is `position: absolute` with a `LinearGradient` that matches the app's root background gradient, fading to transparent at its bottom edge. Content renders behind it — each screen's `ScrollView`/`FlatList` uses `contentPaddingTop` (from `useScreenLayout()`) as its top padding so the first item starts below the header. The subtitle fades out as the user scrolls via an `Animated.Value` driven by `onScrollHandler` (a plain callback that calls `scrollY.setValue()`). Screens that programmatically reset scroll on blur must also call `resetScrollY()` to restore the subtitle opacity.

**50-second countdown then status polling.** After triggering a booking, the app shows a 50-second progress bar (the time the workflow typically takes to complete). Once the countdown finishes it switches to a polling phase: it calls `/api/status` every 10 seconds (up to 10 attempts) to check the GitHub Actions workflow result via the `correlationId`. On success or failure it shows the result; if all polls are exhausted it shows a timeout state with a "Check Again" button to resume polling.

**`correlationId` for workflow matching.** Each booking generates a UUID that is passed through as the workflow run name. The status function searches recent `repository_dispatch` workflow runs for one whose name contains the correlationId, allowing the correct run to be identified even when multiple users trigger concurrently.

**Timer and correlation state persists across restarts.** `triggered_at` and `correlation_id` are stored in AsyncStorage. On app launch, if a booking was triggered recently and is still within the countdown/polling window, the app resumes the correct state rather than losing progress.

**Demo mode for Google Play review.** Hardcoded demo credentials in `use-booking.ts` (`DEMO_EMAIL` / `DEMO_PASSWORD`) bypass the real Netlify/GitHub backend and simulate a full booking success locally. When detected, the app skips the API call, runs a short randomised countdown (3–5 seconds), then transitions straight to the success state with a fake last-booking record. This lets Play Store reviewers exercise the entire booking UI without needing a real HSP membership or triggering actual bookings. The same credentials are provided in app store testing declarations.

**Web uses relative API URLs.** On web the app is served from the same origin as the Netlify functions, so `fetch("/api/book")` works without setting `EXPO_PUBLIC_API_URL`. Native builds still need the full URL.

**i18n uses custom React Context (no external library).** Translations live in `src/i18n/i18n.json` — flat key map with `{ en, ga, de }` per key. `LocaleProvider` reads/writes `app_locale` from AsyncStorage on native; web is locked to English. `useLocale()` returns `{ locale, setLocale, t }` where `t(key)` does a simple lookup. `TranslationKey` is derived from the JSON keys for compile-time safety. The Settings tab (native only) has a `LanguageSwitcher` — a bottom-sheet modal listing all three languages.

**Contentful fetches happen client-side.** Unlike Strava (which proxies through a Netlify function because the tokens are secret), Contentful CDA tokens are public/read-only by design. The app calls `cdn.contentful.com` directly via a generic typed fetcher in `src/services/contentful/`. Event data is cached in AsyncStorage (`app_contentful_events`) for 1 hour with stale-on-error fallback. The `UpcomingEventCard` fetches on mount and passes data to the `UpcomingEventsScreen` via nav params to avoid a redundant request.

**`MobileAppDataContext` owns all remote data.** `MobileAppDataProvider` centralises fetching for Contentful `mobileAppData`, Contentful events, and Strava. It exposes `{ data, events, stravaData, loading, refresh, refreshContentful }`. `refresh(force?)` fetches all three via `Promise.allSettled` and returns `Promise<void>`; on web it skips events and Strava. `refreshContentful()` fetches Contentful only and returns `Promise<void>`. Both methods share a `fetchingRef` guard to prevent concurrent calls. Card components (`UpcomingEventCard`, `StravaCards`, `NoticeCard`) read from context directly — no self-fetching. `NoticeCard` accepts a `message` prop; callers source the message from context.

**Pull-to-refresh on Club, Book, Upcoming Events, and Gallery Detail screens.** Each screen's `onRefresh` calls `refresh(true).finally(...)` (Club) or `refreshContentful().finally(...)` (Book, Upcoming Events) to drive a `<RefreshControl>` spinner. Gallery Detail refreshes both gallery data and likes in parallel. `force=true` bypasses TTL caches but always writes fresh data back. Tab-focus refreshes call `refreshContentful()` (Contentful only, no Strava, no force, no loading spinner).

**Photo likes use Netlify Blobs.** Each gallery has one blob (`gallery:{id}`) mapping `{ imageId: userId[] }`. `likes.ts` exposes GET (fetch all likes for a gallery with per-user `liked` state) and POST (like/unlike). The client (`useLikes` hook) does optimistic UI updates — flips `liked` and adjusts `count` immediately, reverts on server error. Gallery thumbnails are sorted by like count descending. Anonymous user identity is a `crypto.randomUUID()` (via `expo-crypto`) stored in SecureStore (`app_user_id`) — survives iOS reinstall via Keychain. Concurrent write races on the blob are an accepted limitation at this scale.

**Credential encryption in transit.** `book.ts` encrypts email and password with AES-256-GCM (`ENCRYPTION_KEY`) before including them in `client_payload`. GitHub only ever stores ciphertext. The workflow decrypts using `ENCRYPTION_KEY` (GitHub secret) and immediately masks the plaintext. Generate the key with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` — store the same 64-char hex value in both Netlify env vars and GitHub Actions secrets.
