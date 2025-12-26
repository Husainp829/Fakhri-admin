/**
 * Utility to clear all permission-related caches
 * Call this when permissions.ts is updated to force refresh
 */

/**
 * Clear all permission caches
 * This should be called after updating permissions.ts
 *
 * Usage:
 * - In browser console: import { clearAllPermissionCaches } from './utils/clearPermissionCache'; clearAllPermissionCaches();
 * - Or add ?refreshPermissions=true to URL
 */
export const clearAllPermissionCaches = () => {
  // Set cache bust flag in sessionStorage
  const timestamp = Date.now();
  sessionStorage.setItem("permissionsCacheBust", timestamp.toString());

  // Clear localStorage (may contain cached data)
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.includes("permission") || key.includes("cache")) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Error clearing localStorage cache:", error);
  }

  // Trigger a custom event that components can listen to
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("permissionsCacheCleared", { detail: { timestamp } }));
  }

  // Reload the page to clear module-level caches
  // This is the most reliable way to clear all caches
  if (typeof window !== "undefined") {
    window.location.reload();
  }
};

/**
 * Clear permission caches without reloading
 * This sets a flag that components check before using cache
 */
export const clearPermissionCachesSoft = () => {
  // Add a timestamp to force cache refresh
  const timestamp = Date.now();
  if (typeof window !== "undefined") {
    sessionStorage.setItem("permissionsCacheBust", timestamp.toString());

    // Trigger a custom event that components can listen to
    window.dispatchEvent(new CustomEvent("permissionsCacheCleared", { detail: { timestamp } }));
  }
};

/**
 * Check if cache should be busted
 */
export const shouldBustCache = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const bustTimestamp = sessionStorage.getItem("permissionsCacheBust");
  if (!bustTimestamp) {
    return false;
  }

  // If cache was busted in the last 5 minutes, skip cache
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return parseInt(bustTimestamp, 10) > fiveMinutesAgo;
};

/**
 * Check URL for refresh parameter and clear cache if present
 * Call this on app initialization
 */
export const checkAndClearCacheFromURL = () => {
  if (typeof window === "undefined") {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("refreshPermissions") === "true") {
    clearPermissionCachesSoft();
    // Remove the parameter from URL
    urlParams.delete("refreshPermissions");
    const queryString = urlParams.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }
};
