# Hamburg GAA - HSP Booking

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Playwright](https://img.shields.io/badge/-playwright-%232EAD33?style=for-the-badge&logo=playwright&logoColor=white)

Skip the multi-step signup. Book your Hochschulsport training session in one tap.

## What it does

The HSP Hamburg website makes you navigate several pages, log in through a non-standard form, and click through confirmations, all within a tight enrollment window. This app removes that friction.

Enter your HSP credentials and pick your sport (Hurling & Camogie or Gaelic Football). Tap the button. The app handles the rest and you get a confirmation email directly from Hochschulsport Hamburg.

## Your credentials are safe

Your HSP username and password are never stored on any server and are not logged or retained anywhere outside your own device.

On **Android**, credentials are saved in the device's secure keystore and loaded automatically each time you open the app.

On **web**, credentials are not stored by default. If you want them remembered across browser sessions, check the "Remember details in this browser" option below the password field. Unchecking it immediately removes anything stored. If you leave it unchecked you will need to re-enter your details each visit.

## Commands

**Development:**
```bash
npm start          # Expo dev server — opens in Expo Go on device/simulator
npm run web        # Expo dev server, web only
npm run build:web  # Production web export → dist/
npx netlify dev    # Full local stack: web app + functions at localhost:8888
```

For `netlify dev`, open `http://localhost:8888` (not the Metro port 8081). The Netlify proxy routes `/api/*` to the local functions and everything else to Metro.

**Android builds (EAS Build):**
```bash
npm run release:preview      # APK (sideload)
npm run release:production   # AAB
```

**OTA updates (JS/asset-only changes, no new native build needed):**
```bash
npm run ota:preview          # Push update to preview channel
npm run ota:production       # Push update to production channel
```

EAS Update uses the `fingerprint` runtime version policy — updates are only delivered to builds with a matching native layer. Any native dependency change (new plugin, SDK upgrade) requires a full rebuild.

