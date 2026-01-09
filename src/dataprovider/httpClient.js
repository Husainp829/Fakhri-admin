/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
import dayjs from "dayjs";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { fetchUtils } from "react-admin";
import { authObj } from "../firebaseConfig";
import { getRouteIdFromPathname } from "../utils/routeUtility";

export const getToken = async () => {
  let token = localStorage.getItem("AUTH_TOKEN");
  const expireTime = localStorage.getItem("EXPIRE_TIME");

  if (expireTime < dayjs().valueOf() || !token) {
    token = await new Promise((resolve, reject) => {
      onAuthStateChanged(authObj, async (user) => {
        if (user) {
          const to = await getIdToken(user, true);
          localStorage.setItem("AUTH_TOKEN", to);
          localStorage.setItem("EXPIRE_TIME", dayjs().add(3000, "second").valueOf());

          return resolve(to);
        }
        return reject();
      });
    });
  }
  return token;
};

export default async (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({});
  }

  const token = await getToken();
  const eventId = getRouteIdFromPathname();
  options.headers.set("Accept", "application/json");
  options.headers.set("Authorization", token);
  options.headers.set("EventID", eventId);

  try {
    return await fetchUtils.fetchJson(url, options);
  } catch (error) {
    // Transform NestJS error format to react-admin expected format
    let errorMessage = "An error occurred";

    // Check error.body.message (which can be an object or string)
    if (error?.body?.message) {
      if (typeof error.body.message === "string") {
        errorMessage = error.body.message;
      } else if (typeof error.body.message === "object" && error.body.message.message) {
        // Nested message object: { message: "...", error: "...", statusCode: ... }
        errorMessage = error.body.message.message;
      }
    } else if (error?.json?.message) {
      // Check error.json.message
      if (typeof error.json.message === "string") {
        errorMessage = error.json.message;
      } else if (typeof error.json.message === "object" && error.json.message.message) {
        errorMessage = error.json.message.message;
      }
    } else if (error?.json?.error) {
      // Fallback to error.json.error or error.body.error
      errorMessage = error.json.error;
    } else if (error?.body?.error) {
      errorMessage = error.body.error;
    }

    // Update error.message and error.json to match react-admin's expected format
    error.message = errorMessage;
    if (error.json) {
      error.json = {
        message: errorMessage,
      };
    }

    throw error;
  }
};
