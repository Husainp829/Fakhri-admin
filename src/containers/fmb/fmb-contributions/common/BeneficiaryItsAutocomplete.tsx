import React, { useMemo, useState } from "react";
import {
  AutocompleteInput,
  required,
  useGetList,
  useGetOne,
  type AutocompleteInputProps,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

function choiceLabel(c: { ITS_ID?: string; Full_Name?: string }) {
  if (!c?.ITS_ID) return "";
  const name = c.Full_Name?.trim();
  return name ? `${c.ITS_ID} · ${name}` : String(c.ITS_ID);
}

/**
 * Beneficiary ITS: pick from ITS directory rows for the FMB household (HOF_ID),
 * or use "create" option / Enter to keep an ITS not present in our data.
 */
export function BeneficiaryItsAutocomplete(props: AutocompleteInputProps) {
  const { helperText, ...rest } = props;
  const { control } = useFormContext();
  const [searchText, setSearchText] = useState("");
  const fmbId = useWatch({ control, name: "fmbId" });
  const beneficiaryItsNo = useWatch({ control, name: "beneficiaryItsNo" });

  const { data: fmb } = useGetOne("fmbData", { id: fmbId }, { enabled: Boolean(fmbId) });

  const hofId = fmb?.itsNo != null && fmb?.itsNo !== "" ? String(fmb.itsNo).trim() : "";

  const { data: familyRows = [], isPending: familyPending } = useGetList(
    "itsData",
    {
      filter: hofId ? { HOF_ID: hofId } : {},
      pagination: { page: 1, perPage: 500 },
      sort: { field: "Full_Name", order: "ASC" },
    },
    { enabled: Boolean(hofId) }
  );

  const { data: directoryRows = [], isPending: directoryPending } = useGetList(
    "itsData",
    {
      filter: searchText ? { q: searchText } : {},
      pagination: { page: 1, perPage: 50 },
      sort: { field: "Full_Name", order: "ASC" },
    },
    { enabled: Boolean(searchText) }
  );

  const choices = useMemo(() => {
    const family = (familyRows || []).map((row) => ({
      id: row.id,
      ITS_ID: row.ITS_ID,
      Full_Name: row.Full_Name ?? "",
    }));
    const familyIds = new Set(family.map((r) => String(r.ITS_ID)));
    const others = (directoryRows || [])
      .filter((row) => !familyIds.has(String(row.ITS_ID)))
      .map((row) => ({
        id: row.id,
        ITS_ID: row.ITS_ID,
        Full_Name: row.Full_Name ?? "",
      }));
    const list = [...family, ...others];
    const v =
      beneficiaryItsNo != null && beneficiaryItsNo !== "" ? String(beneficiaryItsNo).trim() : "";
    if (v && !list.some((c) => String(c.ITS_ID) === v)) {
      list.push({
        id: `adhoc:${v}`,
        ITS_ID: v,
        Full_Name: "",
      });
    }
    return list;
  }, [familyRows, directoryRows, beneficiaryItsNo]);

  return (
    <AutocompleteInput
      source="beneficiaryItsNo"
      label="Beneficiary ITS"
      choices={choices}
      optionText={choiceLabel}
      optionValue="ITS_ID"
      translateChoice={false}
      loading={(Boolean(hofId) && familyPending) || (Boolean(searchText) && directoryPending)}
      clearOnBlur={false}
      onInputChange={(_, value) => setSearchText(value?.trim?.() ?? "")}
      fullWidth
      helperText={
        helperText ??
        (hofId
          ? "Family members are shown first; typing also searches ITS directory. You can still use an ITS not in directory."
          : "Select an FMB record first")
      }
      validate={[required()]}
      onCreate={(filter) => {
        const t = typeof filter === "string" ? filter.trim() : "";
        if (!t) return null;
        return { id: `adhoc:${t}`, ITS_ID: t, Full_Name: "" };
      }}
      createItemLabel={(filter) => `Use ITS "${String(filter).trim()}" (not in directory)`}
      {...rest}
    />
  );
}
