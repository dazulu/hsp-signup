# Hamburg GAA — HSP Booking

The Hochschulsport (HSP) Hamburg website uses a clunky, multi-step signup process that requires navigating several pages, logging in through a non-standard form, and clicking through confirmations — all within a tight enrollment window. This app removes that friction.

## How it works

A simple Expo mobile app that triggers an automated booking with one tap:

1. **You** enter your HSP credentials and pick a sport (Hurling or Gaelic Football)
2. **The app** sends a request to a Netlify function, which triggers a GitHub Actions workflow
3. **The workflow** runs a Playwright script that navigates the HSP website, logs in, and completes the booking on your behalf
4. **You** get a confirmation email directly from Hochschulsport Hamburg

Credentials are stored locally on-device using Expo SecureStore and are never persisted anywhere else.

## License

[MIT](https://choosealicense.com/licenses/mit/)
