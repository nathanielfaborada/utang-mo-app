# Utang Mo — Mobile App

React + Capacitor app for tracking sari-sari store customer credit (utang).
Offline-first — all data stored locally on-device via IndexedDB.

## Setup

```bash
npm install
npm run build
npx cap sync
```

## Run on Android (requires Android Studio installed)

```bash
npx cap open android
```

This opens the project in Android Studio. From there:
- **Run** button → installs on connected device/emulator for testing
- **Build > Generate Signed Bundle / APK** → produces the `.apk` file to distribute

## Making changes

Edit files in `src/`, then repeat:
```bash
npm run build
npx cap sync
```
before opening/rebuilding in Android Studio.

## Data

All customer and utang/bayad records live in the device's local IndexedDB —
nothing is sent to a server. Use the **Export** button in the app to download
a JSON backup.
