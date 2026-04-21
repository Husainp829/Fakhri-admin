import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextInput, useDataProvider } from "react-admin";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import debounce from "lodash.debounce";
import { useFormContext, useWatch } from "react-hook-form";

const ITS_AUTO_LEN = 8;

/** Stable default — avoid `filter = {}` in params (new object every render → runSearch churn → effect loop). */
const NO_EXTRA_FILTER: Record<string, unknown> = {};

const defaultHelperText = `Enter ${ITS_AUTO_LEN}-digit ITS; lookup runs automatically`;

type LookupHint =
  | { variant: "default" }
  | { variant: "notInDirectory"; its: string }
  | { variant: "lookupError"; message: string };

function setDefaultHintIfNeeded(setter: Dispatch<SetStateAction<LookupHint>>) {
  setter((prev) => (prev.variant === "default" ? prev : { variant: "default" }));
}

function hintToHelperNode(hint: LookupHint): ReactNode {
  if (hint.variant === "default") {
    return defaultHelperText;
  }
  if (hint.variant === "notInDirectory") {
    return (
      <Box component="span" sx={{ typography: "caption", color: "text.secondary" }}>
        ITS {hint.its} is not in the directory — enter the host name manually in the field below
      </Box>
    );
  }
  return (
    <Box component="span" sx={{ typography: "caption", color: "error.main" }}>
      {hint.message}
    </Box>
  );
}

type OhbatITSLookupProps = {
  source: string;
  label: string;
  optional?: boolean;
  filter?: Record<string, unknown>;
};

/**
 * Host ITS: no search button — when exactly {ITS_AUTO_LEN} digits are entered, itsdata is queried (debounced).
 */
export default function OhbatITSLookup({
  source,
  label,
  optional = false,
  filter = NO_EXTRA_FILTER,
}: OhbatITSLookupProps) {
  const { setValue, control } = useFormContext();
  const dataProvider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [lookupHint, setLookupHint] = useState<LookupHint>({ variant: "default" });
  const lastQueryRef = useRef("");
  const prevHostItsRef = useRef<string | undefined>(undefined);
  const watchedValRef = useRef("");

  const currentVal = useWatch({ control, name: source });
  watchedValRef.current = String(currentVal ?? "").trim();

  const clearHostDetails = useCallback(() => {
    setValue("hostName", "");
    setValue("address", "");
    setValue("mobileNo", "");
  }, [setValue]);

  const runSearch = useCallback(
    (q: unknown) => {
      const t = String(q ?? "").trim();
      if (!/^\d{8}$/.test(t)) {
        return;
      }
      if (lastQueryRef.current === t) {
        return;
      }
      setDefaultHintIfNeeded(setLookupHint);
      setLoading(true);
      dataProvider
        .getList("itsdata", {
          pagination: { page: 1, perPage: 10 },
          sort: { field: "ITS_ID", order: "ASC" },
          filter: {
            q: t,
            includeFamily: true,
            ...filter,
          },
        })
        .then(({ data }) => {
          if (watchedValRef.current !== t) {
            return;
          }
          if (data.length > 0) {
            const row = data[0] as {
              ITS_ID?: string;
              Full_Name?: string;
              Address?: string;
              Mobile?: string;
            };
            lastQueryRef.current = t;
            setValue(source, row.ITS_ID);
            if (source === "hostItsNo") {
              setValue("hostName", row.Full_Name ?? "");
              setValue("address", row.Address);
              setValue("mobileNo", row.Mobile);
            }
            setDefaultHintIfNeeded(setLookupHint);
          } else {
            lastQueryRef.current = t;
            setLookupHint({ variant: "notInDirectory", its: t });
          }
        })
        .catch((e: unknown) => {
          console.error(e);
          if (watchedValRef.current !== t) {
            return;
          }
          setLookupHint({
            variant: "lookupError",
            message: e instanceof Error ? e.message : "ITS lookup failed",
          });
        })
        .finally(() => setLoading(false));
    },
    [dataProvider, filter, setValue, source]
  );

  const debouncedSearch = useMemo(() => debounce((q: unknown) => runSearch(q), 400), [runSearch]);

  useEffect(() => {
    const t = String(currentVal ?? "").trim();

    if (source === "hostItsNo") {
      const prev = prevHostItsRef.current;
      if (prev !== undefined && prev !== t) {
        clearHostDetails();
        lastQueryRef.current = "";
        setDefaultHintIfNeeded(setLookupHint);
      }
      prevHostItsRef.current = t;

      if (!/^\d{8}$/.test(t)) {
        lastQueryRef.current = "";
        debouncedSearch.cancel();
        clearHostDetails();
        setDefaultHintIfNeeded(setLookupHint);
        return undefined;
      }

      debouncedSearch(t);
      return () => {
        debouncedSearch.cancel();
      };
    }

    if (/^\d{8}$/.test(t)) {
      debouncedSearch(t);
    } else {
      setDefaultHintIfNeeded(setLookupHint);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [clearHostDetails, currentVal, debouncedSearch, source]);

  const helperText = useMemo(() => hintToHelperNode(lookupHint), [lookupHint]);

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, width: "100%" }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TextInput
          source={source}
          label={label}
          fullWidth
          helperText={helperText}
          isRequired={!optional}
        />
      </Box>
      {loading ? <CircularProgress size={22} sx={{ mt: 2 }} /> : null}
    </Box>
  );
}
