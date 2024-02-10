import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import packageJson from "../package.json";

const buildDateGreaterThan = (latestDate, currentDate) => {
  const momLatestDateTime = dayjs(latestDate);
  const momCurrentDateTime = dayjs(currentDate);

  if (momLatestDateTime.isAfter(momCurrentDateTime)) {
    return true;
  }
    return false;
};

function withClearCache(Component) {
  function ClearCacheComponent(props) {
    const [isLatestBuildDate, setIsLatestBuildDate] = useState(false);

    useEffect(() => {
      fetch("/meta.json")
        .then((response) => response.json())
        .then((meta) => {
          const latestVersionDate = meta.buildDate;
          const currentVersionDate = packageJson.buildDate;

          const shouldForceRefresh = buildDateGreaterThan(
            latestVersionDate,
            currentVersionDate
          );
          if (shouldForceRefresh) {
            setIsLatestBuildDate(false);
            refreshCacheAndReload();
          } else {
            setIsLatestBuildDate(true);
          }
        });
    }, []);

    const refreshCacheAndReload = () => {
      if (caches) {
        // Service worker cache should be cleared with caches.delete()
        caches.keys().then((names) => {
          names.map((name) => caches.delete(name));
        });
      }
      // delete browser cache and hard reload
      window.location.reload(true);
    };

    return (
      <>
        {isLatestBuildDate ? <Component {...props} /> : null}
      </>
    );
  }

  return ClearCacheComponent;
}

export default withClearCache;
