/**
 * Reads Firebase email action link query params (password reset, etc.).
 * Supports params on `window.location.search` and in the hash fragment
 * (e.g. `/#/reset-password?mode=resetPassword&oobCode=...`).
 */
export function getFirebaseEmailActionParams(): { mode: string | null; oobCode: string | null } {
  if (typeof window === "undefined") {
    return { mode: null, oobCode: null };
  }

  const fromSearch = new URLSearchParams(window.location.search);
  let mode = fromSearch.get("mode");
  let oobCode = fromSearch.get("oobCode");

  const { hash } = window.location;
  const q = hash.indexOf("?");
  if (q >= 0) {
    const hashParams = new URLSearchParams(hash.slice(q + 1));
    mode = mode ?? hashParams.get("mode");
    oobCode = oobCode ?? hashParams.get("oobCode");
  }

  return { mode, oobCode };
}

/** Continue URL for password-reset emails (hash router). */
export function buildPasswordResetContinueUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const { origin, pathname } = window.location;
  if (pathname === "/" || pathname === "") {
    return `${origin}/#/reset-password`;
  }
  const normalized = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return `${origin}${normalized}/#/reset-password`;
}
