/* eslint-disable brace-style */
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { LRUCache } from "lru-cache";
import { authObj } from "./firebaseConfig";
import { goToLogin } from "./utils";
import httpClient from "./dataprovider/httpClient";
import { apiUrl } from "./constants";
import { parsePermissionsArray } from "./utils/permissionUtils";

// --------------------
// Helpers
// --------------------
const cache = new LRUCache({
  max: 50, // max 50 users cached
  ttl: 1000 * 60 * 5, // 5 min TTL
});

// Cache for auth state promise to prevent multiple listeners
let authStatePromise = null;

/**
 * Wait for auth state to be ready, reusing promise if already waiting
 * Returns null if user is not authenticated
 */
const waitForAuthState = () => {
  // If user is already available, return immediately
  if (authObj.currentUser) {
    return Promise.resolve(authObj.currentUser);
  }

  // Reuse existing promise if already waiting
  if (authStatePromise) {
    return authStatePromise;
  }

  // Create new promise to wait for auth state
  authStatePromise = new Promise((resolve) => {
    const timeout = setTimeout(() => {
      authStatePromise = null;
      resolve(null);
    }, 5000); // 5 second timeout

    const unsubscribe = onAuthStateChanged(authObj, (authUser) => {
      clearTimeout(timeout);
      unsubscribe();
      authStatePromise = null;
      resolve(authUser || null);
    });
  });

  return authStatePromise;
};

const clearSession = async () => {
  await signOut(authObj);
  localStorage.clear();
  goToLogin();
};

// --------------------
// Core logic
// --------------------
/**
 * Fetch permissions from API endpoint
 * Returns array of permission strings (e.g., ["bookings.view", "bookings.edit"])
 */
const fetchPermissionsFromAPI = async () => {
  try {
    const url = `${apiUrl}/admins/me/permissions`;
    const response = await httpClient(url);

    // API returns { count: number, rows: string[] } based on AdminsService.getAdminPermissions
    // Handle both wrapped format and direct array format
    const { json } = response;
    if (!json) {
      return [];
    }

    // Try to extract permissions array from various formats
    const permissions =
      (Array.isArray(json.rows) && json.rows) ||
      (Array.isArray(json) && json) ||
      (json.rows && Array.isArray(json.rows) && json.rows) ||
      [];

    if (!Array.isArray(permissions)) {
      console.error("Invalid permissions format from API:", json);
      return [];
    }

    return permissions;
  } catch (error) {
    // If 401, user is not authenticated - let checkError handle it
    if (error?.status === 401 || error?.json?.statusCode === 401) {
      throw error;
    }
    // For other errors, log and return empty array to prevent app crash
    console.error("Error fetching permissions from API:", error);
    return [];
  }
};

const getCachedPermissions = async (force = false) => {
  // Wait for auth state to be ready
  const user = await waitForAuthState();

  // If no user after waiting, return empty permissions
  if (!user) {
    return {};
  }

  const cacheKey = user.uid;

  // Check cache first (unless force refresh)
  if (!force) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Fetch permissions from API
  const permissionArray = await fetchPermissionsFromAPI();

  // Parse and cache permissions (empty object if no permissions)
  const permissions =
    permissionArray && permissionArray.length > 0
      ? parsePermissionsArray(permissionArray)
      : {};

  cache.set(cacheKey, permissions);
  return permissions;
};

// --------------------
// Auth Provider
// --------------------
const authProvider = {
  login: async ({ username, password }) => {
    try {
      const { user } = await signInWithEmailAndPassword(
        authObj,
        username,
        password
      );

      // Always fetch fresh permissions from API on login
      const permissionArray = await fetchPermissionsFromAPI();

      if (!permissionArray || permissionArray.length === 0) {
        // User has no permissions - clear session
        await clearSession();
        throw new Error("Unauthorized: No permissions assigned");
      }

      // Parse and warm cache
      const permissions = parsePermissionsArray(permissionArray);
      cache.set(user.uid, permissions);
    } catch (error) {
      // If it's already an Error with message, rethrow it
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise wrap it
      throw new Error(error.message || "Login failed");
    }
  },

  logout: async () => {
    await clearSession();
  },

  checkError: async (error) => {
    if (error?.status === 401) {
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

  getPermissions: async (force = false) => {
    try {
      return await getCachedPermissions(force);
    } catch (error) {
      // If error is 401, let checkError handle it
      if (error?.status === 401) {
        throw error;
      }
      // For other errors, log and return empty permissions to prevent app crash
      // waitForAuthState handles auth gracefully, so most errors are unexpected
      console.error("Error getting permissions:", error);
      return {};
    }
  },
};

export default authProvider;
