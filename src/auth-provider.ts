import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  getIdToken,
  type User,
} from "firebase/auth";
import { LRUCache } from "lru-cache";
import type { AuthProvider } from "ra-core";
import { authObj } from "@/firebase-config";
import { goToLogin } from "@/utils";
import httpClient from "@/dataprovider/http-client";
import { getApiUrl } from "@/constants";
import { fetchAndStoreTenantBrandingTheme } from "@/utils/tenant-branding-cache";
import { parsePermissionsArray } from "@/utils/permission-utils";
import type { PermissionRecord } from "@/types/permissions";

const cache = new LRUCache<string, PermissionRecord>({
  max: 50,
  ttl: 1000 * 60 * 5,
});

let authStatePromise: Promise<User | null> | null = null;

const waitForAuthState = (): Promise<User | null> => {
  if (authObj.currentUser) {
    return Promise.resolve(authObj.currentUser);
  }

  if (authStatePromise) {
    return authStatePromise;
  }

  authStatePromise = new Promise((resolve) => {
    const timeout = setTimeout(() => {
      authStatePromise = null;
      resolve(null);
    }, 5000);

    const unsubscribe = onAuthStateChanged(authObj, (authUser) => {
      clearTimeout(timeout);
      unsubscribe();
      authStatePromise = null;
      resolve(authUser ?? null);
    });
  });

  return authStatePromise;
};

const clearSession = async (): Promise<void> => {
  await signOut(authObj);
  localStorage.clear();
  sessionStorage.clear();
  cache.clear();
  const { href } = window.location;
  const url = new URL(href);
  window.location.replace(`${url.origin}/#/login?reload=${Date.now()}`);
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function httpLikeError(error: unknown): { status?: number; json?: unknown } | null {
  if (!isRecord(error)) return null;
  return error;
}

const fetchPermissionsFromAPI = async (): Promise<string[]> => {
  try {
    const url = `${getApiUrl()}/admins/me/permissions`;
    const response = await httpClient(url);

    const { json } = response;
    if (!json) {
      return [];
    }

    const permissionsRaw = Array.isArray(json)
      ? json
      : isRecord(json) && Array.isArray(json.rows)
        ? json.rows
        : [];

    if (!Array.isArray(permissionsRaw)) {
      console.error("Invalid permissions format from API:", json);
      return [];
    }

    return permissionsRaw.filter((p): p is string => typeof p === "string");
  } catch (error: unknown) {
    const err = httpLikeError(error);
    const status = err?.status;
    const jsonBody = err?.json;
    const statusCode = isRecord(jsonBody) ? jsonBody.statusCode : undefined;
    if (status === 401 || statusCode === 401) {
      throw error;
    }
    console.error("Error fetching permissions from API:", error);
    return [];
  }
};

const getCachedPermissions = async (force = false): Promise<PermissionRecord> => {
  const user = await waitForAuthState();

  if (!user) {
    return {};
  }

  const cacheKey = user.uid;

  let shouldForceRefresh = force;
  if (!shouldForceRefresh && typeof window !== "undefined") {
    const bustTimestamp = sessionStorage.getItem("permissionsCacheBust");
    if (bustTimestamp) {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      if (parseInt(bustTimestamp, 10) > fiveMinutesAgo) {
        shouldForceRefresh = true;
        cache.delete(cacheKey);
      }
    }
  }

  if (!shouldForceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const permissionArray = await fetchPermissionsFromAPI();

  const permissions =
    permissionArray && permissionArray.length > 0 ? parsePermissionsArray(permissionArray) : {};

  cache.set(cacheKey, permissions);
  return permissions;
};

const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const { user } = await signInWithEmailAndPassword(authObj, username, password);

      const idToken = await getIdToken(user, true);
      localStorage.setItem("AUTH_TOKEN", idToken);
      localStorage.setItem("EXPIRE_TIME", String(Date.now() + 3000 * 1000));

      const permissionArray = await fetchPermissionsFromAPI();

      if (!permissionArray || permissionArray.length === 0) {
        await clearSession();
        throw new Error("Unauthorized: No permissions assigned");
      }

      const permissions = parsePermissionsArray(permissionArray);
      cache.set(user.uid, permissions);

      await fetchAndStoreTenantBrandingTheme().catch(() => {
        /* optional; theme falls back to code defaults */
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      const message =
        isRecord(error) && typeof error.message === "string" ? error.message : "Login failed";
      throw new Error(message);
    }
  },

  logout: async () => {
    await clearSession();
  },

  checkError: async (error: unknown) => {
    const err = httpLikeError(error);
    if (err?.status === 401) {
      await clearSession();
      throw error;
    }
  },

  checkAuth: async () => {
    const user = await waitForAuthState();
    if (user) {
      return Promise.resolve();
    }
    goToLogin();
    throw new Error("Not authenticated");
  },

  getPermissions: async () => {
    try {
      return await getCachedPermissions(false);
    } catch (error: unknown) {
      const err = httpLikeError(error);
      if (err?.status === 401) {
        throw error;
      }
      console.error("Error getting permissions:", error);
      return {};
    }
  },
};

export default authProvider;
