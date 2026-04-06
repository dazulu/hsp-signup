# Hamburg GAA

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Playwright](https://img.shields.io/badge/-playwright-%232EAD33?style=for-the-badge&logo=playwright&logoColor=white)


## What is this

The companion app for Hamburg GAA. Book Hochschulsport training sessions, browse photo galleries, like your favourite photos, check upcoming events, and stay connected with the club.



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

## Releasing

### Preview (sideloaded APK)

1. Bump `version` in `app.json` **and** `package.json`.
2. Commit and push: `git commit -am "chore: bump version to x.y.z" && git push`
3. Build: `npm run release:preview`
4. Once the build completes, download the APK from the EAS dashboard and distribute it.

### Production (e.g. Play Store AAB)

1. If not bumped from preview, bump `version` in `app.json` **and** `package.json`.
2. Commit and push: `git commit -am "chore: bump version to x.y.z" && git push`
3. Build: `npm run release:production`
4. The `versionCode` auto-increments (configured via `autoIncrement` + `appVersionSource: "remote"` in `eas.json`).
5. Upload the AAB from the EAS dashboard to the Google Play Console.

### OTA update (no new build)

If the change is JS/assets only and no native dependencies changed:

1. `npm run ota:preview` or `npm run ota:production`

> **Important:** Always bump `version` in both `app.json` and `package.json` before building. The version is baked into the native binary and cannot be changed with an OTA update.

