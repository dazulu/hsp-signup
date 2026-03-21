# Hamburg GAA — HSP Booking

The Hochschulsport (HSP) Hamburg website uses a clunky, multi-step signup process that requires navigating several pages, logging in through a non-standard form, and clicking through confirmations — all within a tight enrollment window. This app removes that friction.

## How it works

A simple Expo mobile app that triggers an automated booking with one tap:

1. **You** enter your HSP credentials and pick a sport (Hurling or Gaelic Football)
2. **The app** sends a request to a Netlify function, which triggers a GitHub Actions workflow
3. **The workflow** runs a Playwright script that navigates the HSP website, logs in, and completes the booking on your behalf
4. **You** get a confirmation email directly from Hochschulsport Hamburg

Credentials are stored locally on-device using Expo SecureStore and are never persisted anywhere else.

## Architecture

```
Expo App (React Native)
  → Netlify Function (/api/book)
    → GitHub Actions (repository_dispatch)
      → Playwright script (tests/signup.spec.ts)
        → HSP website booking
```

The app doesn't talk to the HSP website directly. It calls a Netlify serverless function that triggers a GitHub Actions workflow via `repository_dispatch`. The workflow runs a Playwright browser automation script that handles the actual multi-page signup flow.

## Environment variables

| Where | Variable | Purpose |
|-------|----------|---------|
| `.env` (Expo) | `EXPO_PUBLIC_API_URL` | Base URL of the Netlify site |
| `.env` (Expo) | `EXPO_PUBLIC_API_KEY` | Shared secret to authenticate app → Netlify |
| Netlify | `API_KEY` | Same shared secret (server side) |
| Netlify | `GITHUB_PAT` | GitHub personal access token to trigger workflows |

HSP login credentials are entered by the user in the app and passed through the Netlify function to the GitHub Actions workflow via `client_payload`. They are never stored on any server.

## Design decisions

**60-second loading timer instead of status polling.** GitHub Actions workflows can't be reliably associated with the user who triggered them via `repository_dispatch`. Rather than polling an ambiguous status endpoint, the app shows a fixed 60s countdown (the workflow typically completes in ~50s) and then tells the user to check their email. The timer state persists across app restarts via AsyncStorage.

**2-minute cooldown.** After triggering a booking, a 120s cooldown prevents accidental double submissions.

## License

[MIT](https://choosealicense.com/licenses/mit/)
