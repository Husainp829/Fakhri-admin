import { useEffect, useState } from "react";

export function parsePathname(pathname: string = window.location.pathname): {
  baseRoute: string | null;
  routeId: string | null;
} {
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

export function parseHash(): string[] {
  const hash = window.location.hash.replace(/^#+/, "");
  return hash.split("/").filter(Boolean);
}

export function getBaseRouteFromPathname(
  pathname: string = window.location.pathname
): string | null {
  const { baseRoute } = parsePathname(pathname);
  return baseRoute;
}

export function getRouteIdFromPathname(pathname: string = window.location.pathname): string | null {
  const { routeId } = parsePathname(pathname);
  return routeId;
}

export function navigateToBaseRoute(
  baseRoute: string | null,
  routeId: string | null = null,
  hashPaths: string[] = []
): void {
  let pathname = "/";

  if (!baseRoute) {
    window.history.replaceState({}, "", "/#/");
    window.dispatchEvent(new Event("popstate"));
    window.dispatchEvent(new Event("hashchange"));
    return;
  }
  const normalizedBase = baseRoute.replace(/^\/+|\/+$/g, "");
  pathname = `/${normalizedBase}/`;

  if (routeId) {
    pathname += `${routeId}/`;
  }

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

  const newUrl = pathname + hash;
  window.history.pushState({}, "", newUrl);

  window.dispatchEvent(new Event("popstate"));
  window.dispatchEvent(new Event("hashchange"));
}

export function useRouteParams(): { baseRoute: string | null; routeId: string | null } {
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

export function useBaseRoute(): string | null {
  const { baseRoute } = useRouteParams();
  return baseRoute;
}

export function useRouteId(): string | null {
  const { routeId } = useRouteParams();
  return routeId;
}
