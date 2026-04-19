import { afterEach, describe, expect, it } from "vitest";

import {
  buildPasswordResetContinueUrl,
  getFirebaseEmailActionParams,
} from "./firebase-email-action-params";

describe("getFirebaseEmailActionParams", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("reads mode and oobCode from search params", () => {
    window.history.replaceState({}, "", "/?mode=resetPassword&oobCode=abc123");
    expect(getFirebaseEmailActionParams()).toEqual({ mode: "resetPassword", oobCode: "abc123" });
  });

  it("reads mode and oobCode from hash query", () => {
    window.history.replaceState({}, "", "/#/reset-password?mode=resetPassword&oobCode=xyz");
    expect(getFirebaseEmailActionParams()).toEqual({ mode: "resetPassword", oobCode: "xyz" });
  });

  it("prefers search over hash when both set", () => {
    window.history.replaceState(
      {},
      "",
      "/?mode=resetPassword&oobCode=fromSearch#/other?oobCode=fromHash"
    );
    expect(getFirebaseEmailActionParams().oobCode).toBe("fromSearch");
  });
});

describe("buildPasswordResetContinueUrl", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("builds root hash URL", () => {
    window.history.replaceState({}, "", "http://localhost:3001/");
    expect(buildPasswordResetContinueUrl()).toBe("http://localhost:3001/#/reset-password");
  });

  it("builds path-prefixed hash URL", () => {
    window.history.replaceState({}, "", "http://localhost:3001/admin/");
    expect(buildPasswordResetContinueUrl()).toBe("http://localhost:3001/admin/#/reset-password");
  });
});
