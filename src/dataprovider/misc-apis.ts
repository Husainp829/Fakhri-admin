import axios, { type AxiosResponse } from "axios";
import { getApiUrl } from "@/constants";
import { getToken } from "./http-client";

export type CallApiParams = {
  location: string;
  data?: unknown;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  id?: string | number;
};

export const callApi = async ({
  location,
  data = {},
  method = "POST",
  headers = {},
  id,
}: CallApiParams): Promise<AxiosResponse<unknown>> => {
  const token = await getToken();
  return axios({
    method,
    url: `${getApiUrl(location)}/${location}${id != null ? `/${id}` : ""}`,
    ...(method === "GET" ? { params: data } : { data }),
    headers: {
      "Content-Type": "application/json",
      authorization: token,
      ...headers,
    },
  });
};

export type CallApiWithoutAuthParams = {
  location: string;
  data?: unknown;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  id?: string | number | null;
};

export const callApiWithoutAuth = async ({
  location,
  data = {},
  method = "POST",
  id = null,
}: CallApiWithoutAuthParams): Promise<AxiosResponse<unknown>> =>
  axios({
    method,
    url: `${getApiUrl(location)}/${location}${id != null ? `/${id}` : ""}`,
    [method === "GET" ? "params" : "data"]: data,
    headers: { "Content-Type": "application/json" },
  });
