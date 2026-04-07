import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";

function normalizeIts(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

/** True = at least one itsdata row for this ITS_ID; false = confirmed absent; null = unknown / incomplete ITS. */
export function useItsNoInItsdata(itsNo: unknown): {
  inDirectory: boolean | null;
  checking: boolean;
} {
  const dataProvider = useDataProvider();
  const [inDirectory, setInDirectory] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const its = normalizeIts(itsNo);
    if (!its || !/^\d+$/.test(its) || its.length < 5) {
      setInDirectory(null);
      setChecking(false);
      return;
    }

    let alive = true;
    setChecking(true);
    const timer = window.setTimeout(() => {
      dataProvider
        .getMany("itsdata", { ids: [its] })
        .then(({ data }) => {
          if (!alive) return;
          setInDirectory(Array.isArray(data) && data.length > 0);
        })
        .catch(() => {
          if (!alive) return;
          setInDirectory(false);
        })
        .finally(() => {
          if (alive) setChecking(false);
        });
    }, 300);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [itsNo, dataProvider]);

  return { inDirectory, checking };
}
