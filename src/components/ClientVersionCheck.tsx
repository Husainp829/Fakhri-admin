import React, { useState, useEffect, useCallback, type ComponentType } from "react";
import dayjs from "dayjs";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import packageJson from "../../package.json";

type MetaJson = { buildDate: number | string };

type PackageJsonWithBuild = typeof packageJson & { buildDate?: number | string };

const POLL_INTERVAL_MS = 15 * 60 * 1000;

const normalizeBuildDate = (value: number | string | undefined): string => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
};

const buildDateGreaterThan = (latestDate: string, currentDate: string): boolean => {
  const momLatestDateTime = dayjs(latestDate);
  const momCurrentDateTime = dayjs(currentDate);

  return momLatestDateTime.isAfter(momCurrentDateTime);
};

async function fetchMetaBuildDate(): Promise<number | string | undefined> {
  const response = await fetch(`/meta.json?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("meta.json request failed");
  }
  const meta = (await response.json()) as MetaJson;
  return meta.buildDate;
}

function withClientVersionCheck<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  function ClientVersionCheckWrapper(props: P) {
    const [bootChecked, setBootChecked] = useState(() => Boolean(import.meta.env.DEV));
    const [updateAvailable, setUpdateAvailable] = useState(false);

    const currentVersionDate = normalizeBuildDate((packageJson as PackageJsonWithBuild).buildDate);

    const checkForUpdate = useCallback(async () => {
      if (import.meta.env.DEV) {
        return;
      }
      try {
        const latestRaw = await fetchMetaBuildDate();
        const latestVersionDate = normalizeBuildDate(latestRaw);
        const stale = buildDateGreaterThan(latestVersionDate, currentVersionDate);
        setUpdateAvailable(stale);
      } catch {
        // Keep previous updateAvailable on transient network errors.
      } finally {
        setBootChecked(true);
      }
    }, [currentVersionDate]);

    useEffect(() => {
      if (import.meta.env.DEV) {
        return;
      }
      void checkForUpdate();
    }, [checkForUpdate]);

    useEffect(() => {
      if (import.meta.env.DEV) {
        return;
      }
      const onVisible = () => {
        if (document.visibilityState === "visible") {
          void checkForUpdate();
        }
      };
      document.addEventListener("visibilitychange", onVisible);
      return () => document.removeEventListener("visibilitychange", onVisible);
    }, [checkForUpdate]);

    useEffect(() => {
      if (import.meta.env.DEV) {
        return;
      }
      const id = window.setInterval(() => void checkForUpdate(), POLL_INTERVAL_MS);
      return () => window.clearInterval(id);
    }, [checkForUpdate]);

    const refreshCacheAndReload = () => {
      if (typeof caches !== "undefined") {
        void caches.keys().then((names) => {
          names.forEach((name) => {
            void caches.delete(name);
          });
        });
      }
      window.location.reload();
    };

    if (!import.meta.env.DEV && !bootChecked) {
      return null;
    }

    return (
      <>
        <Component {...props} />
        <Snackbar
          open={updateAvailable}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          autoHideDuration={null}
          onClose={(_, reason) => {
            if (reason === "clickaway") {
              return;
            }
            setUpdateAvailable(false);
          }}
          sx={{ bottom: { xs: 16, sm: 24 } }}
        >
          <Alert
            variant="filled"
            onClose={() => setUpdateAvailable(false)}
            sx={(theme) => ({
              width: "100%",
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "& .MuiAlert-icon": {
                color: theme.palette.primary.contrastText,
              },
            })}
            action={
              <Button color="inherit" size="small" onClick={refreshCacheAndReload}>
                Refresh
              </Button>
            }
          >
            A new version of the app is available.
          </Alert>
        </Snackbar>
      </>
    );
  }

  return ClientVersionCheckWrapper;
}

export default withClientVersionCheck;
