/* eslint-disable no-unused-vars */
import axios from "axios";
import { apiUrl, getApiUrl } from "../constants";
import { getToken } from "./httpClient";

export const callApi = async ({ location, data = {}, method = "POST", headers = {}, id }) => {
  const token = await getToken();
  return axios({
    method,
    url: `${getApiUrl(location)}/${location}${id ? `/${id}` : ""}`,
    ...(method === "GET" ? { params: data } : { data }),
    headers: {
      "Content-Type": "application/json",
      authorization: token,
      ...headers,
    },
  }).then((response) => response);
};
export const callApiWithoutAuth = async ({ location, data = {}, method = "POST", id = null }) =>
  axios({
    method,
    url: `${getApiUrl(location)}/${location}${id ? `/${id}` : ""}`,
    [method === "GET" ? "params" : "data"]: data,
    headers: { "Content-Type": "application/json" },
  }).then((response) => response);
