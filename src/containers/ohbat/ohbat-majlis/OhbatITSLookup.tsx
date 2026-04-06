import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextInput, useDataProvider, useNotify } from "react-admin";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import debounce from "lodash.debounce";
import { useFormContext, useWatch } from "react-hook-form";

const ITS_AUTO_LEN = 8;

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
  filter = {},
}: OhbatITSLookupProps) {
  const { setValue, control } = useFormContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  const lastQueryRef = useRef("");
  const prevHostItsRef = useRef<string | undefined>(undefined);

  const currentVal = useWatch({ control, name: source });

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
          } else {
            notify(`ITS ${t} was not found in ITS data`, { type: "error" });
          }
        })
        .catch((e: unknown) => {
          console.error(e);
          notify(e instanceof Error ? e.message : "ITS lookup failed", { type: "error" });
        })
        .finally(() => setLoading(false));
    },
    [dataProvider, filter, notify, setValue, source]
  );

  const debouncedSearch = useMemo(() => debounce((q: unknown) => runSearch(q), 400), [runSearch]);

  useEffect(() => {
    const t = String(currentVal ?? "").trim();

    if (source === "hostItsNo") {
      const prev = prevHostItsRef.current;
      if (prev !== undefined && prev !== t) {
        clearHostDetails();
        lastQueryRef.current = "";
      }
      prevHostItsRef.current = t;

      if (!/^\d{8}$/.test(t)) {
        lastQueryRef.current = "";
        debouncedSearch.cancel();
        clearHostDetails();
        return undefined;
      }

      debouncedSearch(t);
      return () => {
        debouncedSearch.cancel();
      };
    }

    if (/^\d{8}$/.test(t)) {
      debouncedSearch(t);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [clearHostDetails, currentVal, debouncedSearch, source]);

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, width: "100%" }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TextInput
          source={source}
          label={label}
          fullWidth
          helperText={`Enter ${ITS_AUTO_LEN}-digit ITS; lookup runs automatically`}
          isRequired={!optional}
        />
      </Box>
      {loading ? <CircularProgress size={22} sx={{ mt: 2 }} /> : null}
    </Box>
  );
}
