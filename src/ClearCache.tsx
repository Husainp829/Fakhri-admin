import React, { useState, useEffect, type ComponentType } from "react";
import dayjs from "dayjs";
import packageJson from "../package.json";

type MetaJson = { buildDate: string };

type PackageJsonWithBuild = typeof packageJson & { buildDate?: string };

const buildDateGreaterThan = (latestDate: string, currentDate: string): boolean => {
  const momLatestDateTime = dayjs(latestDate);
  const momCurrentDateTime = dayjs(currentDate);

  return momLatestDateTime.isAfter(momCurrentDateTime);
};

function withClearCache<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  function ClearCacheComponent(props: P) {
    const [isLatestBuildDate, setIsLatestBuildDate] = useState(false);

    const refreshCacheAndReload = () => {
      if (typeof caches !== "undefined") {
        caches.keys().then((names) => {
          names.forEach((name) => {
            void caches.delete(name);
          });
        });
      }
      window.location.reload();
    };

    useEffect(() => {
      // In dev, `public/meta.json` is often newer than the bundled `package.json` buildDate after a
      // production build — comparing them would call `reload()` forever.
      if (import.meta.env.DEV) {
        setIsLatestBuildDate(true);
        return;
      }

      void fetch("/meta.json")
        .then((response) => response.json() as Promise<MetaJson>)
        .then((meta) => {
          const latestVersionDate = meta.buildDate;
          const currentVersionDate = (packageJson as PackageJsonWithBuild).buildDate ?? "";

          const shouldForceRefresh = buildDateGreaterThan(latestVersionDate, currentVersionDate);
          if (shouldForceRefresh) {
            setIsLatestBuildDate(false);
            refreshCacheAndReload();
          } else {
            setIsLatestBuildDate(true);
          }
        });
    }, []);

    return <>{isLatestBuildDate ? <Component {...props} /> : null}</>;
  }

  return ClearCacheComponent;
}

export default withClearCache;
