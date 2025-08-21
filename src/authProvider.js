import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  getIdTokenResult,
  signOut,
} from "firebase/auth";
import { LRUCache } from "lru-cache";
import { authObj } from "./firebaseConfig";
import { goToLogin } from "./utils";

// --------------------
// Helpers
// --------------------
const cache = new LRUCache({
  max: 50, // max 50 users cached
  ttl: 1000 * 60 * 5, // 5 min TTL
});

const parsePermissions = (permissions = []) =>
  permissions.reduce((acc, p) => {
    const [resource, perm = "view"] = p.split(".");
    acc[resource] = { ...acc[resource], [perm]: true };
    return acc;
  }, {});

const clearSession = async () => {
  await signOut(authObj);
  localStorage.clear();
  goToLogin();
};

// --------------------
// Core logic
// --------------------
const getCachedPermissions = async () => {
  const user = authObj.currentUser;
  if (!user) throw new Error("No user");

  const cacheKey = user.uid;

  // Always check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // If not cached, fetch once and populate
  const token = await getIdTokenResult(user, true); // force refresh
  const permissions = parsePermissions(token?.claims?.permissions || []);

  cache.set(cacheKey, permissions);
  return permissions;
};

// --------------------
// Auth Provider
// --------------------
const authProvider = {
  login: async ({ username, password }) => {
    try {
      const { user } = await signInWithEmailAndPassword(authObj, username, password);

      // Always fetch fresh claims on login
      const token = await getIdTokenResult(user, true);
      const permissions = token?.claims?.permissions;

      if (!permissions) {
        await clearSession();
        throw new Error("Unauthorized");
      }

      // Warm cache
      cache.set(user.uid, parsePermissions(permissions));
    } catch (error) {
      throw new Error(error.message);
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
    if (authObj.currentUser) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const unsub = onAuthStateChanged(authObj, (user) => {
        unsub();
        if (user) {
          return resolve();
        }
        goToLogin();
        return reject(new Error("Not authenticated"));
      });
    });
  },

  getPermissions: async (force = false) => getCachedPermissions(force),
};

export default authProvider;
