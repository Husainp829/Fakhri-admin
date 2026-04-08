import React, { useEffect, useMemo, useState } from "react";
import { AutocompleteInput, useGetList, type AutocompleteInputProps } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

function normalizeString(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

/** One autocomplete row: directory hit or synthetic “not in directory” choice. */
type FmbItsChoice = {
  id: string;
  ITS_ID: string;
  Full_Name: string;
  Mobile?: string;
  Address?: string;
};

function choiceLabel(c: { ITS_ID?: string; Full_Name?: string }) {
  if (!c?.ITS_ID) return "";
  const name = c.Full_Name?.trim();
  return name ? `${c.ITS_ID} · ${name}` : String(c.ITS_ID);
}

/**
 * Household ITS for a new FMB record: search itsdata, or commit an ITS not present in the directory.
 * When the selected ITS matches a loaded itsdata row, name / mobile / empty thali addresses are prefilled.
 */
export function FmbHouseholdItsAutocomplete(props: AutocompleteInputProps) {
  const { helperText, ...rest } = props;
  const { setValue, getValues } = useFormContext();
  const [searchText, setSearchText] = useState("");
  const itsNo = useWatch({ name: "itsNo" });

  const { data: directoryRows = [], isPending } = useGetList(
    "itsdata",
    {
      filter: searchText ? { q: searchText } : {},
      pagination: { page: 1, perPage: 50 },
      sort: { field: "Full_Name", order: "ASC" },
    },
    { enabled: Boolean(searchText.trim()) }
  );

  const choices = useMemo((): FmbItsChoice[] => {
    const list: FmbItsChoice[] = (directoryRows || []).map((row) => ({
      id: String(row.id),
      ITS_ID: String(row.ITS_ID ?? "").trim(),
      Full_Name: (row.Full_Name as string | undefined) ?? "",
      Mobile: row.Mobile as string | undefined,
      Address: row.Address as string | undefined,
    }));
    const v = itsNo != null && itsNo !== "" ? String(itsNo).trim() : "";
    if (v && !list.some((c) => c.ITS_ID === v)) {
      list.push({ id: `adhoc:${v}`, ITS_ID: v, Full_Name: "" });
    }
    return list;
  }, [directoryRows, itsNo]);

  useEffect(() => {
    const v = normalizeString(itsNo);
    if (!v) {
      setValue("name", null);
      setValue("mobileNo", null);
      return;
    }
    const row = (directoryRows || []).find((r) => String(r.ITS_ID ?? "").trim() === v) as
      | { Full_Name?: string; Mobile?: string; Address?: string }
      | undefined;
    if (!row) {
      return;
    }
    setValue("name", row.Full_Name?.trim() || null);
    setValue("mobileNo", row.Mobile?.trim() || null);
    const itsAddress = normalizeString(row.Address);
    if (itsAddress) {
      const thalis = getValues("thalis") as unknown[] | undefined;
      if (Array.isArray(thalis)) {
        thalis.forEach((thali, idx) => {
          const trow = thali as { deliveryAddress?: string };
          if (!normalizeString(trow?.deliveryAddress)) {
            setValue(`thalis.${idx}.deliveryAddress`, itsAddress, { shouldDirty: true });
          }
        });
      }
    }
  }, [itsNo, directoryRows, setValue, getValues]);

  return (
    <AutocompleteInput
      source="itsNo"
      label="ITS No."
      choices={choices}
      optionText={choiceLabel}
      optionValue="ITS_ID"
      translateChoice={false}
      loading={Boolean(searchText.trim()) && isPending}
      clearOnBlur={false}
      onInputChange={(_, value) => setSearchText(value?.trim?.() ?? "")}
      fullWidth
      helperText={
        helperText ??
        "Search ITS directory or use “not in directory” to enter any ITS. Name and address prefill when a directory row matches."
      }
      onCreate={(filter) => {
        const t = typeof filter === "string" ? filter.trim() : "";
        if (!t) return null;
        return { id: `adhoc:${t}`, ITS_ID: t, Full_Name: "" } satisfies FmbItsChoice;
      }}
      createItemLabel={(filter) => `Use ITS "${String(filter).trim()}" (not in directory)`}
      {...rest}
    />
  );
}
