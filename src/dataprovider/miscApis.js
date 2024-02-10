/* eslint-disable no-unused-vars */
import axios from "axios";
import { apiUrl } from "../constants";
import { getToken } from "./httpClient";

export const callApi = async (location, body, requestType) => {
  const token = await getToken();
  return axios({
    method: requestType || "POST",
    url: `${apiUrl}/${location}`,
    data: body,
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
  })
    .then((response) => response);
};

export const callApiWithoutAuth = async (location, body, requestType) =>
  axios({
    method: requestType || "POST",
    url: `${apiUrl}/${location}`,
    data: body,
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response);
