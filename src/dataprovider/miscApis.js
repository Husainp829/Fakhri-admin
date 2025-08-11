/* eslint-disable no-unused-vars */
import axios from "axios";
import { apiUrl } from "../constants";
import { getToken } from "./httpClient";

export const callApi = async (location, data, requestType, headers = {}) => {
  const token = await getToken();
  return axios({
    method: requestType || "POST",
    url: `${apiUrl}/${location}`,
    ...(requestType === "GET" ? { params: data } : { data }),
    headers: {
      "Content-Type": "application/json",
      authorization: token,
      ...headers,
    },
  }).then((response) => response);
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
