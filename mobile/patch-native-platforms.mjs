import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scheme = "in.talentpassport.app";

function ensureText(file, needle, insertion) {
  if (!fs.existsSync(file)) throw new Error(`Missing native file: ${file}`);
  const text = fs.readFileSync(file, "utf8");
  if (text.includes(needle)) return false;
  fs.writeFileSync(file, text.replace("</plist>", insertion + "\n</plist>"));
  return true;
}

// iOS: register the app URL scheme used by Supabase password recovery.
const iosInfo = path.join(root, "ios", "App", "App", "Info.plist");
if (fs.existsSync(iosInfo)) {
  const text = fs.readFileSync(iosInfo, "utf8");
  if (!text.includes("CFBundleURLTypes")) {
    const insertion = `\n  <key>CFBundleURLTypes</key>\n  <array>\n    <dict>\n      <key>CFBundleURLName</key>\n      <string>${scheme}</string>\n      <key>CFBundleURLSchemes</key>\n      <array>\n        <string>${scheme}</string>\n      </array>\n    </dict>\n  </array>`;
    fs.writeFileSync(iosInfo, text.replace("</dict>\n</plist>", insertion + "\n</dict>\n</plist>"));
  }

  // Expose native Documents to the iOS Files app. Existing Web/PWA behaviour
  // is unaffected because this only modifies the generated iOS Info.plist.
  let updatedText = fs.readFileSync(iosInfo, "utf8");
  if (!updatedText.includes("UIFileSharingEnabled")) {
    updatedText = updatedText.replace(
      "</dict>\n</plist>",
      "  <key>UIFileSharingEnabled</key>\n  <true/>\n  <key>LSSupportsOpeningDocumentsInPlace</key>\n  <true/>\n</dict>\n</plist>"
    );
    fs.writeFileSync(iosInfo, updatedText);
  }
}

// iOS: install the Filesystem plugin's required privacy manifest into the
// standard Capacitor App folder. Xcode may still require adding it to the App
// target's resources on the first native setup.
const privacySource = path.join(root, "mobile", "PrivacyInfo.xcprivacy");
const privacyDest = path.join(root, "ios", "App", "App", "PrivacyInfo.xcprivacy");
if (fs.existsSync(path.dirname(privacyDest))) {
  fs.copyFileSync(privacySource, privacyDest);
}

// Android: replace the generated custom URL scheme with the stable app id and
// ensure a browsable VIEW intent exists for recovery/invitation deep links.
const androidStrings = path.join(root, "android", "app", "src", "main", "res", "values", "strings.xml");
if (fs.existsSync(androidStrings)) {
  let text = fs.readFileSync(androidStrings, "utf8");
  const re = /<string name="custom_url_scheme">[^<]*<\/string>/;
  if (re.test(text)) {
    text = text.replace(re, `<string name="custom_url_scheme">${scheme}</string>`);
  } else if (!text.includes(`name="custom_url_scheme"`)) {
    text = text.replace("</resources>", `  <string name="custom_url_scheme">${scheme}</string>\n</resources>`);
  }
  fs.writeFileSync(androidStrings, text);
}

const androidManifest = path.join(root, "android", "app", "src", "main", "AndroidManifest.xml");
if (fs.existsSync(androidManifest)) {
  let text = fs.readFileSync(androidManifest, "utf8");
  const marker = `android:scheme="@string/custom_url_scheme"`;
  if (!text.includes(marker)) {
    const filter = `\n            <intent-filter>\n                <action android:name="android.intent.action.VIEW" />\n                <category android:name="android.intent.category.DEFAULT" />\n                <category android:name="android.intent.category.BROWSABLE" />\n                <data android:scheme="@string/custom_url_scheme" />\n            </intent-filter>`;
    const activityClose = text.indexOf("</activity>");
    if (activityClose >= 0) {
      text = text.slice(0, activityClose) + filter + "\n        " + text.slice(activityClose);
      fs.writeFileSync(androidManifest, text);
    }
  }
}

console.log("Native platform patch completed.");
