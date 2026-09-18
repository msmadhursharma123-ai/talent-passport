# Talent Passport Release V1 — Audit Record

## Scope
Release packaging only: Android APK/AAB signing and Play publication preparation, plus iOS Archive/TestFlight/App Store preparation.

## Product-code freeze
No React/TypeScript source file is modified by this pack.
No Supabase/authentication/database migration is modified.
No desktop/tablet/mobile CSS is modified.
No Academic Year, Daily Log, Doubt Resolution, Loop 1, Loop 2, Live Intelligence, PDF generation, password recovery, or native runtime source is modified.

## Android inspection result
The supplied Android project already has:
- `applicationId "in.talentpassport.app"`
- `compileSdk = 36`
- `targetSdkVersion = 36`
- `minSdkVersion = 24`
- Gradle wrapper 8.14.3
- Android Gradle Plugin 8.13.0
- versionCode 1 / versionName 1.0
- existing Android PDF saver plugin and MainActivity registration
- custom URL scheme `in.talentpassport.app`

No target-SDK change is required for Google Play under the current 2026 requirement because API 36 is already configured.

## iOS inspection result
The supplied iOS project already has:
- bundle identifier `in.talentpassport.app`
- marketing version 1.0
- build 1
- deployment target 15.0
- Development Team `W7F5BVQ6YR`
- Automatic signing
- iPhone + iPad target families
- existing privacy manifest
- existing custom URL scheme for native recovery
- AppIcon asset catalog

The release Mac reports Xcode 27.0, which satisfies Apple's current App Store Connect build minimum.

## Files changed/added by this release pack
Existing file changed:
- `android/.gitignore` (hidden file; it is intentionally present in the ZIP at this exact path) — only adds ignores for release signing secrets.

New files:
- `android/keystore.properties.example` — placeholders only; contains no real secret.
- `release/RELEASE_V1_CHECKLIST.md` — release procedure.
- `release/RELEASE_V1_AUDIT.md` — this audit.

## Intentionally NOT changed
- `capacitor.config.ts`
- `package.json`
- `package-lock.json`
- `index.html`
- `vite.config.ts`
- `tsconfig.json`
- Android `build.gradle`, `app/build.gradle`, `variables.gradle`, manifest, MainActivity, PDF plugin
- iOS `project.pbxproj`, `Info.plist`, `PrivacyInfo.xcprivacy`, Swift files, assets

## Signing safety
Real Android keystores, passwords, certificates, provisioning credentials, and App Store Connect API keys must remain outside the source pack. They are account/secrets material, not application source.

## ZIP integrity
The ZIP is an overlay pack, not a replacement project. It contains exactly four files:
- `android/.gitignore`
- `android/keystore.properties.example`
- `release/RELEASE_V1_AUDIT.md`
- `release/RELEASE_V1_CHECKLIST.md`
No Android/iOS application source, Gradle, Xcode, React, TypeScript, CSS, asset, database, or configuration file is included for replacement.
