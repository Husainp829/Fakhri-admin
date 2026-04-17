import React from "react";
import { Labeled, useInput } from "react-admin";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import debounce from "lodash.debounce";
import { getApiUrl } from "@/constants";
import httpClient from "@/dataprovider/http-client";

export type ThaliTagsInputProps = {
  source?: string;
  label?: string;
};

export function ThaliTagsInput(props: ThaliTagsInputProps) {
  const source = props.source ?? "tags";
  const label = props.label ?? "Tags";
  const { id, field, fieldState, isRequired } = useInput({
    source,
    label,
    defaultValue: [] as string[],
    format: (v) =>
      Array.isArray(v) ? (v as unknown[]).filter((x): x is string => typeof x === "string") : [],
  });

  const [options, setOptions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const loadOptions = React.useCallback(async (q: string) => {
    setLoading(true);
    try {
      const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      const { json } = await httpClient(`${getApiUrl()}/fmbData/thali-tag-suggestions${qs}`);
      const body = json as { rows?: string[] };
      setOptions(body.rows ?? []);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedLoad = React.useMemo(
    () => debounce((q: string) => void loadOptions(q), 250),
    [loadOptions]
  );

  React.useEffect(() => () => debouncedLoad.cancel(), [debouncedLoad]);

  const value = Array.isArray(field.value) ? (field.value as string[]) : [];

  return (
    <Labeled id={id} label={label} source={source} isRequired={isRequired} fullWidth>
      <Autocomplete<string, true, false, true>
        multiple
        freeSolo
        options={options}
        value={value}
        loading={loading}
        onBlur={field.onBlur}
        onChange={(_, newValue) => {
          const next = newValue.map((x) => String(x).trim()).filter(Boolean);
          const seen = new Set<string>();
          const deduped: string[] = [];
          for (const t of next) {
            const k = t.toLowerCase();
            if (seen.has(k)) continue;
            seen.add(k);
            deduped.push(t);
          }
          field.onChange(deduped);
        }}
        onOpen={() => void loadOptions("")}
        filterOptions={(x) => x}
        onInputChange={(_, input, reason) => {
          if (reason === "input") debouncedLoad(input);
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={`${option}-${index}`}
              label={option}
              size="small"
              variant="outlined"
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            id={id}
            name={field.name}
            placeholder="Add tag, Enter to confirm"
            error={!!fieldState.error}
            helperText={
              fieldState.error?.message ??
              "Suggestions from tags used elsewhere; you can enter new tags freely."
            }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </Labeled>
  );
}
