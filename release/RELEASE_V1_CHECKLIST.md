# Talent Passport — Release V1 Checklist

This release pack is intentionally **runtime-neutral**. It does not change React/TypeScript business logic, portal UI, Supabase/authentication, Academic Year, Daily Log, Doubt Resolution, Loop 1/Loop 2, Live Intelligence, or the already-verified native password/PDF flows.

## Android

Current verified release prerequisites:
- applicationId: `in.talentpassport.app`
- minSdk: 24
- compileSdk: 36
- targetSdk: 36
- Gradle wrapper: 8.14.3
- Android Gradle Plugin: 8.13.0
- Java/JVM used in the verified environment: 21
- versionCode: 1
- versionName: 1.0

Google Play currently requires new apps and updates to target Android 16 / API 36 or higher from August 31, 2026. The project already targets 36, so no target-SDK upgrade is required for this release.

### Signing
1. Copy `android/keystore.properties.example` to `android/keystore.properties`.
2. Create/retain the permanent upload keystore outside the repository.
3. Configure signing in Android Studio's **Generate Signed Bundle / APK** flow, or use the local signing configuration you establish for this project.
4. Never commit the `.jks`, passwords, or `keystore.properties`.

### Validation sequence
```bash
npm run build
npx cap sync android
cd android
./gradlew clean
./gradlew assembleRelease
./gradlew bundleRelease
cd ..
```

The release AAB must be signed before uploading to Google Play. The release APK is for direct/device validation; Google Play publication uses the AAB.

## iOS

Current verified release prerequisites:
- Bundle ID: `in.talentpassport.app`
- Team: `W7F5BVQ6YR`
- Marketing version: `1.0`
- Build number: `1`
- Deployment target: iOS 15.0
- Xcode verified on the release Mac: 27.0
- Automatic signing enabled
- iPhone + iPad target families enabled

Apple currently requires App Store Connect uploads to be built with Xcode 26 or later using an iOS 26-or-later SDK. Xcode 27 is installed, so the release environment satisfies that minimum.

### Validation sequence
```bash
npm run build
npx cap sync ios
open ios/App/App.xcworkspace
```

In Xcode:
1. Select the **App** target and **Any iOS Device (arm64)**.
2. Confirm **Signing & Capabilities** uses the intended Apple Developer team and bundle identifier.
3. Confirm Release configuration is selected.
4. Product → Archive.
5. Organizer → Distribute App → App Store Connect → Upload.
6. Wait for processing in App Store Connect.
7. Add the processed build to TestFlight for internal testing first.
8. After validation, submit the selected build for App Review.

## Freeze rule
Do not run `npm update`, `npm audit fix`, `npx cap migrate`, Android Studio upgrade wizards, Gradle/AGP/Kotlin upgrades, or dependency upgrades as part of this release unless a concrete build/review error requires it and a separate audited change is prepared.
