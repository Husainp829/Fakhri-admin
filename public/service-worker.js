/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals, no-console */
// Service Worker for JMS Admin PWA
const CACHE_NAME = "jms-admin-25821467";
const RUNTIME_CACHE = "jms-admin-runtime-25821467";

// Assets to cache on install (only essential files that should exist)
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.png",
  "/logo192.png",
  "/logo512.png"
];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching app shell");
        // Cache each URL individually to handle missing files gracefully
        return Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[Service Worker] Failed to cache ${url}:`, err);
              // Return undefined so Promise.allSettled doesn't fail
              return undefined;
            })
          )
        );
      })
      .then((results) => {
        const successful = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;
        console.log(`[Service Worker] Cached ${successful} files, ${failed} failed`);
      })
      .catch((err) => {
        console.error("[Service Worker] Cache initialization failed:", err);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) =>
            // Delete old caches
             cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
          )
          .map((cacheName) => {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          })
      ))
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip API requests - always fetch from network
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If fetch fails, return offline page if available
            if (event.request.destination === "document") {
              return caches.match("/index.html");
            }
            // For non-document requests, return undefined to let the fetch fail
            return undefined;
          });
      })
  );
});
