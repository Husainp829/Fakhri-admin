/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
import dayjs from "dayjs";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { fetchUtils } from "react-admin";
import { authObj } from "../firebaseConfig";
import { getEventId } from "../utils";

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
  const eventId = getEventId();
  options.headers.set("Accept", "application/json");
  options.headers.set("Authorization", token);
  options.headers.set("EventID", eventId);
  return fetchUtils.fetchJson(url, options);
};
