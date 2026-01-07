/* eslint-disable no-console */
const fs = require("fs");
const filePath = "./package.json";

const packageJson = JSON.parse(fs.readFileSync(filePath).toString());
const buildTimestamp = new Date().getTime();
packageJson.buildDate = buildTimestamp;

fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));

const jsonData = {
  buildDate: packageJson.buildDate,
};

const jsonContent = JSON.stringify(jsonData);

try {
  fs.writeFileSync("./public/meta.json", jsonContent, "utf8");
  console.log("Latest build date and time updated in meta.json file");
} catch (error) {
  console.error("An error occurred while saving build date and time to meta.json:", error);
  process.exit(1);
}

// Update service worker cache version for cache busting
const serviceWorkerPath = "./public/service-worker.js";
if (fs.existsSync(serviceWorkerPath)) {
  let serviceWorkerContent = fs.readFileSync(serviceWorkerPath, "utf8");

  // Generate cache version with timestamp (shortened for readability)
  // Using last 8 digits of timestamp to keep it manageable
  const cacheSuffix = buildTimestamp.toString().slice(-8);
  const cacheVersion = `jms-admin-${cacheSuffix}`;
  const runtimeCacheVersion = `jms-admin-runtime-${cacheSuffix}`;

  // Replace cache names with new versions (match any quoted string)
  serviceWorkerContent = serviceWorkerContent.replace(
    /const CACHE_NAME = ["'][^"']+["'];/,
    `const CACHE_NAME = "${cacheVersion}";`
  );
  serviceWorkerContent = serviceWorkerContent.replace(
    /const RUNTIME_CACHE = ["'][^"']+["'];/,
    `const RUNTIME_CACHE = "${runtimeCacheVersion}";`
  );

  fs.writeFileSync(serviceWorkerPath, serviceWorkerContent, "utf8");
  console.log(`Service worker cache version updated to ${cacheVersion}`);
} else {
  console.log("Warning: service-worker.js not found in public directory");
}
