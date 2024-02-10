/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
// import { apiUrl } from "./constants";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  getIdTokenResult,
  signOut,
} from "firebase/auth";
import { authObj } from "./firebaseConfig";
import { goToLogin } from "./utils";

const authProvider = {
  login: (params) => {
    const { username, password } = params;
    return new Promise((resolve, reject) =>
      signInWithEmailAndPassword(authObj, username, password)
        .then(async ({ user }) => {
          const to = await getIdTokenResult(user, true).then((t) => t);
          const permissions = to?.claims?.permissions;
          if (!permissions) {
            await signOut(authObj);
            return reject(new Error("Unauthorized"));
          }
          return resolve();
        })
        .catch((error) => reject(error.message))
    );
  },

  logout: () =>
    new Promise((resolve) =>
      signOut(authObj).then(() => {
        localStorage.clear();
        goToLogin();
        return resolve();
      })
    ),

  checkError: (error) => {
    if (error?.status === 401) {
      return new Promise((resolve, reject) =>
        signOut(authObj).then(() => {
          localStorage.clear();
          goToLogin();
          return reject();
        })
      );
    }
    return Promise.resolve();
  },

  checkAuth: async () =>
    new Promise((resolve, reject) => {
      onAuthStateChanged(authObj, (user) => {
        if (user) {
          return resolve();
        }
        goToLogin();
        return reject();
      });
    }),

  getPermissions: async () =>
    new Promise((resolve, reject) => {
      onAuthStateChanged(authObj, async (user) => {
        if (user) {
          const to = await getIdTokenResult(user, true).then((t) => t);
          const permissions = to?.claims?.permissions || [];
          const permObj = {};
          permissions.map((p) => {
            const [resource, perm = "view"] = p.split(".");
            if (permObj[resource]) {
              permObj[resource] = { ...permObj[resource], [perm]: true };
            } else {
              permObj[resource] = { [perm]: true };
            }
            return null;
          });
          return resolve(permObj);
        }
        return reject();
      });
    }),
};

export default authProvider;
