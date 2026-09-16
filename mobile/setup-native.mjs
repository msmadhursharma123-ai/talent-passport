import { execSync } from "node:child_process";

const packages = [
  "@capacitor/core@8.5.2",
  "@capacitor/cli@8.5.2",
  "@capacitor/app@8",
  "@capacitor/filesystem@8",
  "@capacitor/share@8",
  "@capacitor/android@8.5.2",
  "@capacitor/ios@8.5.2",
];

execSync(`npm install ${packages.join(" ")}`, { stdio: "inherit" });
execSync("npm run build", { stdio: "inherit" });
execSync("npx cap add android", { stdio: "inherit" });
execSync("npx cap add ios", { stdio: "inherit" });
execSync("npx cap sync", { stdio: "inherit" });
execSync("node mobile/patch-native-platforms.mjs", { stdio: "inherit" });
