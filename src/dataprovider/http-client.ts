import dayjs from "dayjs";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { fetchUtils } from "react-admin";
import type { Options } from "ra-core";
import { authObj } from "@/firebase-config";
import { getRouteIdFromPathname } from "@/utils/route-utility";

export const getToken = async (): Promise<string> => {
  let token = localStorage.getItem("AUTH_TOKEN");
  const expireTime = localStorage.getItem("EXPIRE_TIME");

  if (expireTime == null || Number(expireTime) < dayjs().valueOf() || !token) {
    token = await new Promise<string>((resolve, reject) => {
      onAuthStateChanged(authObj, async (user) => {
        if (user) {
          const to = await getIdToken(user, true);
          localStorage.setItem("AUTH_TOKEN", to);
          localStorage.setItem("EXPIRE_TIME", String(dayjs().add(3000, "second").valueOf()));

          resolve(to);
          return;
        }
        reject(new Error("Not authenticated"));
      });
    });
  }
  return token;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function messageFromBody(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined;
  const msg = body.message;
  if (typeof msg === "string") return msg;
  if (isRecord(msg) && typeof msg.message === "string") return msg.message;
  return undefined;
}

function messageFromJson(json: unknown): string | undefined {
  const fromMessage = messageFromBody(json);
  if (fromMessage) return fromMessage;
  if (!isRecord(json)) return undefined;
  const err = json.error;
  return typeof err === "string" ? err : undefined;
}

const httpClient = async (
  url: string | URL,
  options: Options = {}
): Promise<{ status: number; headers: Headers; body: string; json: unknown }> => {
  const opts: Options = { ...options };
  if (!opts.headers) {
    opts.headers = new Headers({});
  }
  const headers = opts.headers as Headers;

  const token = await getToken();
  const eventId = getRouteIdFromPathname() ?? "";
  headers.set("Accept", "application/json");
  headers.set("Authorization", token);
  headers.set("EventID", eventId);

  try {
    return await fetchUtils.fetchJson(url, opts);
  } catch (error: unknown) {
    let errorMessage = "An error occurred";

    if (isRecord(error)) {
      const fromBody = messageFromBody(error.body);
      const fromJson = messageFromJson(error.json);
      if (fromBody) {
        errorMessage = fromBody;
      } else if (fromJson) {
        errorMessage = fromJson;
      }
    }

    if (error instanceof Error) {
      error.message = errorMessage;
    }

    if (isRecord(error) && error.json && isRecord(error.json)) {
      error.json = { message: errorMessage };
    }

    throw error;
  }
};

export default httpClient;
