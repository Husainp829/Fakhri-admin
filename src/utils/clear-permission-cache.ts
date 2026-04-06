/**
 * Utility to clear all permission-related caches
 */

export const clearAllPermissionCaches = (): void => {
  const timestamp = Date.now();
  sessionStorage.setItem("permissionsCacheBust", timestamp.toString());

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

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("permissionsCacheCleared", { detail: { timestamp } }));
  }

  if (typeof window !== "undefined") {
    window.location.reload();
  }
};

export const clearPermissionCachesSoft = (): void => {
  const timestamp = Date.now();
  if (typeof window !== "undefined") {
    sessionStorage.setItem("permissionsCacheBust", timestamp.toString());

    window.dispatchEvent(new CustomEvent("permissionsCacheCleared", { detail: { timestamp } }));
  }
};

export const shouldBustCache = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const bustTimestamp = sessionStorage.getItem("permissionsCacheBust");
  if (!bustTimestamp) {
    return false;
  }

  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return parseInt(bustTimestamp, 10) > fiveMinutesAgo;
};

export const checkAndClearCacheFromURL = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("refreshPermissions") === "true") {
    clearPermissionCachesSoft();
    urlParams.delete("refreshPermissions");
    const queryString = urlParams.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }
};
