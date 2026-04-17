import React, { useEffect, useMemo, useState } from "react";
import {
  AutocompleteInput,
  useDataProvider,
  useGetList,
  type AutocompleteInputProps,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

const ITS_MIN_LEN_FOR_PREFILL = 5;

function normalizeString(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function looksLikeCompleteItsDigits(value: unknown): boolean {
  const its = normalizeString(value);
  if (!its) return false;
  if (!/^\d+$/.test(its)) return false;
  return its.length >= ITS_MIN_LEN_FOR_PREFILL;
}

/** Prefer free-text Address; otherwise join structured ITS fields (common when Address is blank in sync). */
function buildDeliveryAddressFromItsdata(row: {
  Address?: string | null;
  Building?: string | null;
  Street?: string | null;
  Area?: string | null;
  City?: string | null;
  State?: string | null;
  Pincode?: string | null;
}): string {
  const main = normalizeString(row.Address);
  if (main) return main;
  const parts = [row.Building, row.Street, row.Area, row.City, row.State, row.Pincode]
    .map((p) => normalizeString(p))
    .filter(Boolean);
  return parts.join(", ");
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
 * When the selected ITS matches itsdata, name / mobile / thali delivery address (and mohallah from Jamaat)
 * are prefilled. Address is loaded by ITS id so it still works after the search box clears.
 */
export function FmbHouseholdItsAutocomplete(props: AutocompleteInputProps) {
  const { helperText, ...rest } = props;
  const dataProvider = useDataProvider();
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
    if (!looksLikeCompleteItsDigits(v)) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      (async () => {
        try {
          const { data } = await dataProvider.getMany("itsdata", { ids: [v] });
          if (cancelled) return;
          const row = (data ?? []).find(
            (r) => normalizeString((r as { ITS_ID?: string }).ITS_ID) === v
          ) as
            | {
                Full_Name?: string;
                Mobile?: string;
                Jamaat?: string;
                Address?: string;
                Building?: string;
                Street?: string;
                Area?: string;
                City?: string;
                State?: string;
                Pincode?: string;
              }
            | undefined;
          if (!row) return;

          setValue("name", row.Full_Name?.trim() || null);
          setValue("mobileNo", row.Mobile?.trim() || null);

          const itsAddress = buildDeliveryAddressFromItsdata(row);
          const jamaat = normalizeString(row.Jamaat);
          if (!itsAddress && !jamaat) return;

          const thalis = getValues("thalis") as unknown[] | undefined;
          if (!Array.isArray(thalis)) return;
          thalis.forEach((thali, idx) => {
            const trow = thali as { deliveryAddress?: string; deliveryMohallah?: string };
            if (itsAddress && !normalizeString(trow?.deliveryAddress)) {
              setValue(`thalis.${idx}.deliveryAddress`, itsAddress, { shouldDirty: true });
            }
            if (jamaat && !normalizeString(trow?.deliveryMohallah)) {
              setValue(`thalis.${idx}.deliveryMohallah`, jamaat, { shouldDirty: true });
            }
          });
        } catch {
          // keep form usable if lookup fails
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [itsNo, dataProvider, setValue, getValues]);

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
        "Search ITS directory or use “not in directory” to enter any ITS. Name, delivery address, and mohallah prefill from ITS when the number exists in your directory."
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
