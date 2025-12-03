// src/utils/router.js
import { useEffect, useState } from "react";

export function parsePathname(pathname = window.location.pathname) {
  const segments = pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);

  if (segments.length === 0) {
    return { baseRoute: null, routeId: null };
  }

  const baseRoute = segments[0].toLowerCase();
  const routeId = segments.length >= 2 ? segments[1] : null;

  return { baseRoute, routeId };
}

/**
 * Parse the hash part for additional routing
 */
export function parseHash() {
  const hash = window.location.hash.replace(/^#+/, "");
  return hash.split("/").filter(Boolean);
}

/**
 * Get just the baseRoute from pathname.
 */
export function getBaseRouteFromPathname(pathname = window.location.pathname) {
  const { baseRoute } = parsePathname(pathname);
  return baseRoute;
}

/**
 * Get the routeId from pathname.
 */
export function getRouteIdFromPathname(pathname = window.location.pathname) {
  const { routeId } = parsePathname(pathname);
  return routeId;
}

/**
 * Navigate to baseRoute + hash route WITHOUT full page reload.
 * Maintains structure: /baseRoute/routeId/#/paths
 */
export function navigateToBaseRoute(baseRoute, routeId = null, hashPaths = []) {
  // Build the pathname part
  let pathname = "/";

  if (!baseRoute) {
    window.history.replaceState({}, "", "/#/");
    window.dispatchEvent(new Event("popstate"));
    window.dispatchEvent(new Event("hashchange"));
    return;
  }
  if (baseRoute) {
    const normalizedBase = baseRoute.replace(/^\/+|\/+$/g, "");
    pathname = `/${normalizedBase}/`;

    if (routeId) {
      pathname += `${routeId}/`;
    }
  }

  // Build the hash part
  let hash = "";
  if (hashPaths && hashPaths.length > 0) {
    const cleanPaths = hashPaths.filter((p) => p !== "").map((p) => p.replace(/^\/+|\/+$/g, ""));
    if (cleanPaths.length > 0) {
      hash = `#/${cleanPaths.join("/")}/`;
    } else {
      hash = "#/";
    }
  } else {
    hash = "#/";
  }

  // Use History API to change URL without reload
  const newUrl = pathname + hash;
  window.history.pushState({}, "", newUrl);

  // Dispatch events to notify listeners
  window.dispatchEvent(new Event("popstate"));
  window.dispatchEvent(new Event("hashchange"));
}

export function useRouteParams() {
  const [params, setParams] = useState(() => ({
    ...parsePathname(),
  }));

  useEffect(() => {
    const update = () => {
      setParams({
        ...parsePathname(),
      });
    };

    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);

    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);

  return params;
}

/**
 * Hook to watch changes in baseRoute only.
 * For backward compatibility.
 */
export function useBaseRoute() {
  const { baseRoute } = useRouteParams();
  return baseRoute;
}

/**
 * Hook to watch changes in routeId only.
 */
export function useRouteId() {
  const { routeId } = useRouteParams();
  return routeId;
}
