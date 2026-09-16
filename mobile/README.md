# Talent Passport — Native App Layer

This layer wraps the existing React/Vite application with Capacitor. The web application remains the source of truth: the existing React pages, repositories, viewmodels, Supabase schema, authentication/identity services, engines, loops, and responsive CSS are not replaced.

## Targets

- Web / Vercel: unchanged
- Android: Capacitor native shell
- iOS: Capacitor native shell

## Native application id

`in.talentpassport.app`

If this identifier is already registered under a different Apple Bundle ID / Google Play Application ID, change it in `capacitor.config.ts` **before** the first store build.

## First setup after replacing the project

From the project root:

```bash
npm install
npm install @capacitor/core@8.5.2 @capacitor/cli@8.5.2 @capacitor/app@8 @capacitor/filesystem@8 @capacitor/share@8 @capacitor/android@8.5.2 @capacitor/ios@8.5.2
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

`node_modules` is intentionally not part of the source pack.

## Daily native build workflow

```bash
npm run build
npx cap sync
npx cap open android
npx cap open ios
```

Android can be built/tested from Android Studio. iOS requires Xcode on macOS.

## Authentication / password recovery

The web build continues using its existing `window.location.origin` redirect.

The native build uses the registered app scheme `in.talentpassport.app:` so a password-reset link opened on the device can return to the app. The app bootstrap then restores the original recovery query/hash into the existing SPA flow.

The custom scheme must be allow-listed in the Supabase Auth URL configuration for the production project before testing native password recovery.

## Camera / gallery / file inputs

Existing HTML file inputs are intentionally preserved. Capacitor's WebView exposes the device file picker/camera flows without replacing the application's current file-processing/OCR code. No new camera abstraction is forced into existing pages, which minimizes regression risk.

## PDF / generated documents

Existing web downloads remain unchanged on Web/PWA. Native builds use the Capacitor Filesystem + Share plugins only for generated Blob/PDF downloads that were adapted in this pack. The underlying PDF generation remains the existing jsPDF/html2canvas implementation.
