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
  utils.ts                     formatTimeAgo helper (locale-aware)
  i18n/
    i18n.json                  All translatable strings: { key: { en, ga, de } }
    index.tsx                  LocaleContext, LocaleProvider, useLocale() hook
    types.ts                   Locale union type, TranslationKey, LOCALE_LABELS
  hooks/
    use-booking.ts             Booking state machine, effects, callbacks
    use-credentials.ts         Email/password state, opt-in SecureStore persistence (native only)
    use-last-booking-label.ts  Formatted label for last successful booking
    use-welcome-text/          Locale-aware greeting pool
  context/
    mobile-app-data.tsx        MobileAppDataContext — global app config from Contentful (notices, sport disables)
  navigation/
    types.ts                   Navigation param list types
  components/
    booking/                   Booking flow UI (form, progress, result)
    card/
      card.tsx                 Generic Card shell
      card-grid.tsx            Responsive card grid layout
      implementations/
        club-links/            External link cards (website, socials)
        last-booking/          Last booking info card (self-fetching)
        notice/                General notice card (reads data.notice from MobileAppDataContext)
        strava-cards/          Strava activity cards (self-fetching)
        training-notice/       Booking notice card (reads data.booking.notice from MobileAppDataContext)
        upcoming-event/        Next training session card
    error-boundary.tsx         Top-level error boundary
    language-switcher/         Bottom-sheet language picker (native only)
    screen-layout/             Shared screen wrapper (gradient, safe area, scroll)
  screens/
    book.tsx                   Book a training session
    club.tsx                   Club info & links
    photos.tsx                 Photo gallery
    settings.tsx               Settings — language switcher + version card
    upcoming-events.tsx        Upcoming training sessions list
  services/
    contentful/                Generic Contentful CDA client (types + fetcher)
netlify/functions/
  book.ts                      Triggers GitHub Actions repository_dispatch
  status.ts                    Queries workflow run result via correlationId
  strava.ts                    Strava activity proxy
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

| Where | Variable | Purpose |
|-------|----------|---------|
| `.env` (Expo) | `EXPO_PUBLIC_API_URL` | Base URL of the Netlify site, used by native builds only (web uses relative URLs) |
| `.env` (Expo) | `EXPO_PUBLIC_API_KEY` | Shared secret to authenticate app requests to Netlify |
| Netlify | `API_KEY` | Same shared secret (server side) |
| Netlify | `GITHUB_PAT` | GitHub personal access token to trigger and query workflows |
| `.env` (Expo) | `EXPO_PUBLIC_CONTENTFUL_SPACE_ID` | Contentful space ID for CDA requests (public/read-only) |
| `.env` (Expo) | `EXPO_PUBLIC_CONTENTFUL_ACCESS_TOKEN` | Contentful CDA access token (public/read-only) |

HSP login credentials are not env vars — they are entered by the user at runtime and passed through the Netlify function to the GitHub Actions workflow via `client_payload`. They are never stored on any server and are masked in workflow logs via `::add-mask::`.

Credentials are stored on-device using Expo SecureStore (native) only when the user enables "Remember login details on this device". On web, credentials are **never** stored — they live in React state for the duration of the session only. The `secure-store.ts` wrapper abstracts the platform difference.

## Design decisions

**Native credential storage is opt-in.** On native, credentials are only written to Expo SecureStore if the user explicitly checks "Remember login details on this device". Unchecking the box immediately removes any stored credentials. On web, credentials are never persisted — memory only.

**50-second countdown then status polling.** After triggering a booking, the app shows a 50-second progress bar (the time the workflow typically takes to complete). Once the countdown finishes it switches to a polling phase: it calls `/api/status` every 10 seconds (up to 10 attempts) to check the GitHub Actions workflow result via the `correlationId`. On success or failure it shows the result; if all polls are exhausted it shows a timeout state with a "Check Again" button to resume polling.

**`correlationId` for workflow matching.** Each booking generates a UUID that is passed through as the workflow run name. The status function searches recent `repository_dispatch` workflow runs for one whose name contains the correlationId, allowing the correct run to be identified even when multiple users trigger concurrently.

**Timer and correlation state persists across restarts.** `triggered_at` and `correlation_id` are stored in AsyncStorage. On app launch, if a booking was triggered recently and is still within the countdown/polling window, the app resumes the correct state rather than losing progress.

**Demo mode for Google Play review.** Hardcoded demo credentials in `use-booking.ts` (`DEMO_EMAIL` / `DEMO_PASSWORD`) bypass the real Netlify/GitHub backend and simulate a full booking success locally. When detected, the app skips the API call, runs a short randomised countdown (3–5 seconds), then transitions straight to the success state with a fake last-booking record. This lets Play Store reviewers exercise the entire booking UI without needing a real HSP membership or triggering actual bookings. The same credentials are provided in app store testing declarations.

**Web uses relative API URLs.** On web the app is served from the same origin as the Netlify functions, so `fetch("/api/book")` works without setting `EXPO_PUBLIC_API_URL`. Native builds still need the full URL.

**i18n uses custom React Context (no external library).** Translations live in `src/i18n/i18n.json` — flat key map with `{ en, ga, de }` per key. `LocaleProvider` reads/writes `app_locale` from AsyncStorage on native; web is locked to English. `useLocale()` returns `{ locale, setLocale, t }` where `t(key)` does a simple lookup. `TranslationKey` is derived from the JSON keys for compile-time safety. The Settings tab (native only) has a `LanguageSwitcher` — a bottom-sheet modal listing all three languages.

**Contentful fetches happen client-side.** Unlike Strava (which proxies through a Netlify function because the tokens are secret), Contentful CDA tokens are public/read-only by design. The app calls `cdn.contentful.com` directly via a generic typed fetcher in `src/services/contentful/`. Event data is cached in AsyncStorage (`app_contentful_events`) for 1 hour with stale-on-error fallback. The `UpcomingEventCard` fetches on mount and passes data to the `UpcomingEventsScreen` via nav params to avoid a redundant request.

**`MobileAppDataContext` for dynamic app config.** A single Contentful entry (`mobileAppData` / `MOBILE_APP_DATA`) contains a `jsonData` JSON field powering two features: a free-text `notice` string shown as a notice card at the top of the Club screen, and a `booking` object with `notice` (shown above the booking form), `hurlingDisabledUntil`, and `gaelicDisabledUntil` ISO timestamps. When a timestamp is set and in the future, the corresponding sport button is disabled and the Book button is blocked. The context fetches on mount with no AsyncStorage cache; club and book screens call `refresh()` via `useFocusEffect` so data is always current when the screen is viewed. `NoticeCard` and `TrainingNoticeCard` are self-contained display components that read from the context directly — no props needed. The `Card` component accepts a `variant="notice"` prop that applies blue notice styling (`noticeBackground` theme token).
