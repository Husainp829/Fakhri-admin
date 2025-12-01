// src/utils/router.js
import { useEffect, useState } from "react";

/**
 * Extract the first pathname segment.
 * Example: /events/ -> "events"
 */
export function getBaseRouteFromPathname(pathname = window.location.pathname) {
  const seg = pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
  return seg ? seg.toLowerCase() : null;
}

/**
 * Navigate to baseRoute + hash route
 * WITHOUT touching global history object.
 * We just assign window.location which is fully allowed.
 */
export function navigateToBaseRoute(baseRoute, hashPath = "/") {
  if (!baseRoute) return;

  const normalizedBase = `/${baseRoute.replace(/^\/+|\/+$/g, "")}/`;
  const normalizedHash = hashPath.startsWith("#")
    ? hashPath
    : `#${hashPath.startsWith("/") ? hashPath : `/${hashPath}`}`;

  // Full navigation is allowed — no restricted globals touched
  window.location = `${normalizedBase}${normalizedHash}`;
}

/**
 * Hook to watch changes in baseRoute.
 * We listen only to `popstate` and `hashchange` which are allowed.
 */
export function useBaseRoute() {
  const [baseRoute, setBaseRoute] = useState(getBaseRouteFromPathname());

  useEffect(() => {
    const update = () => {
      const br = getBaseRouteFromPathname();
      setBaseRoute(br);
    };

    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);

    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);

  return baseRoute;
}
