import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDataProvider, useInput } from "react-admin";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

/** Stable default when `filter` prop is omitted (avoids new `{}` each render → infinite getList). */
const NO_EXTRA_ITS_FILTER: Record<string, unknown> = {};

type ItsRow = { id?: string; ITS_ID?: string; Full_Name?: string | null };

function rowLabel(r: ItsRow) {
  const id = String(r.ITS_ID ?? "").trim();
  const name = String(r.Full_Name ?? "").trim();
  return id ? `${id} — ${name}` : name || id;
}

/**
 * ITS picker backed by itsdata getList + getMany. Keeps the selected row merged into `options`
 * so the value does not clear when the list refetches (ReferenceInput + AutocompleteInput can
 * drop non-id foreign keys when the selection is not on the current page).
 */
export function OhbatItsdataItsPickerInput({
  source,
  label,
  helperText,
  filter,
  allowEmpty = true,
  debounceMs = 300,
  TextFieldProps: textFieldProps,
}: {
  source: string;
  label: string;
  helperText?: string;
  filter?: Record<string, unknown>;
  allowEmpty?: boolean;
  debounceMs?: number;
  TextFieldProps?: Partial<TextFieldProps>;
}) {
  const dataProvider = useDataProvider();
  const dataProviderRef = useRef(dataProvider);
  dataProviderRef.current = dataProvider;
  const filterRef = useRef(filter ?? NO_EXTRA_ITS_FILTER);
  filterRef.current = filter ?? NO_EXTRA_ITS_FILTER;
  const {
    field,
    fieldState: { error, invalid, isTouched },
    id,
    isRequired,
  } = useInput({ source });

  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<ItsRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<ItsRow | null>(null);
  const [loading, setLoading] = useState(false);

  const itsFromField = String(field.value ?? "").trim();

  useEffect(() => {
    if (!itsFromField) {
      setInputValue("");
      return;
    }
    if (selectedRow && String(selectedRow.ITS_ID ?? "").trim() === itsFromField) {
      const next = rowLabel(selectedRow);
      setInputValue((prev) => (prev === next ? prev : next));
    }
  }, [itsFromField, selectedRow]);

  useEffect(() => {
    if (!itsFromField) {
      setSelectedRow(null);
      return undefined;
    }
    let cancelled = false;
    dataProviderRef.current
      .getMany("itsdata", { ids: [itsFromField] })
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.[0]) {
          setSelectedRow(data[0] as ItsRow);
          return;
        }
        setSelectedRow((prev) =>
          prev && String(prev.ITS_ID ?? "").trim() === itsFromField ? prev : null
        );
      })
      .catch(() => {
        if (!cancelled) {
          setSelectedRow((prev) =>
            prev && String(prev.ITS_ID ?? "").trim() === itsFromField ? prev : null
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [itsFromField]);

  const fetchOptions = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const baseFilter = filterRef.current;
      const { data } = await dataProviderRef.current.getList("itsdata", {
        pagination: { page: 1, perPage: 50 },
        sort: { field: "updatedAt", order: "DESC" },
        filter: { ...baseFilter, ...(q.trim() ? { q: q.trim() } : {}) },
      });
      setOptions((data ?? []) as ItsRow[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchOptions(inputValue);
    }, debounceMs);
    return () => window.clearTimeout(t);
  }, [debounceMs, fetchOptions, inputValue]);

  const mergedOptions = useMemo(() => {
    const row = selectedRow;
    const selId = String(row?.ITS_ID ?? "").trim();
    if (!row || !selId) {
      return options;
    }
    if (options.some((o) => String(o.ITS_ID ?? "").trim() === selId)) {
      return options;
    }
    return [row, ...options];
  }, [options, selectedRow]);

  const showError = Boolean(isTouched && invalid && error?.message);

  return (
    <Autocomplete<ItsRow, false, boolean, false>
      id={id}
      value={selectedRow}
      onChange={(_, v) => {
        setSelectedRow(v);
        const next =
          v?.ITS_ID != null && String(v.ITS_ID).trim() !== "" ? String(v.ITS_ID).trim() : null;
        field.onChange(next);
      }}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      onBlur={field.onBlur}
      options={mergedOptions}
      loading={loading}
      getOptionLabel={(o) => rowLabel(o)}
      isOptionEqualToValue={(a, b) => String(a?.ITS_ID ?? "") === String(b?.ITS_ID ?? "")}
      filterOptions={(opts) => opts}
      clearOnBlur={false}
      disableClearable={!allowEmpty}
      selectOnFocus
      handleHomeEndKeys
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          name={field.name}
          label={label}
          required={isRequired}
          error={showError}
          helperText={
            showError && error?.message
              ? error.message
              : typeof helperText === "string"
                ? helperText
                : undefined
          }
          fullWidth
          inputProps={{
            ...params.inputProps,
            ...textFieldProps?.inputProps,
          }}
        />
      )}
    />
  );
}
