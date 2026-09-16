# Talent Passport Native Regression Checklist

Run this after the first native build and before distribution.

1. Existing Vercel web build still loads and logs in.
2. Student / Teacher / School / Partner / Admin portal entry and identity restoration.
3. Supabase session persistence after app background/foreground.
4. Password reset from native device email back into the app.
5. School invitation/deep-link handling.
6. Student, teacher, school, partner and admin portal navigation.
7. Academic Year selection and onboarding.
8. Daily Log publication and student delivery.
9. Doubt resolution / Loop 1 / Loop 2 / live intelligence flows.
10. Study material, worksheet and image/file upload paths.
11. Camera/gallery/file-picker flows on a physical Android device and physical iPhone/iPad.
12. OCR flows for PDF and camera images.
13. PDF generation and native share/save flow.
14. Existing web/PWA PDF download flow.
15. Keyboard, safe areas, scrolling and responsive layouts on small phones/tablets.
16. Android back-button navigation.
17. App background/resume while an upload/OCR task is active.
18. Supabase Storage uploads from native devices.
19. Logout/login and identity isolation between portals.
20. Vercel deployment after source changes (`npm run build`).

Do not treat a successful `npx cap sync` as proof of end-to-end correctness. Native runtime and store-build testing are required for the final release sign-off.
