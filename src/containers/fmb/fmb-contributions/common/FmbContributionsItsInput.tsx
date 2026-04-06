import React, { useEffect } from "react";
import { AutocompleteInput, useChoicesContext, type AutocompleteInputProps } from "react-admin";
import { useFormContext } from "react-hook-form";

/** ITS for the FMB household (HOF), from list/choice payload */
function householdItsFromChoice(choice: Record<string, unknown> | null | undefined) {
  if (!choice) return "";
  const itsdata = choice.itsdata as Record<string, unknown> | undefined;
  const raw = choice.itsNo ?? itsdata?.ITS_ID ?? null;
  if (raw == null || raw === "") return "";
  return String(raw).trim();
}

export const ITSInput = (props: AutocompleteInputProps) => {
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const selectedChoice = selectedChoices?.[0];

  useEffect(() => {
    if (selectedChoice?.id) {
      const selIts = selectedChoice?.itsdata as Record<string, unknown> | undefined;
      setValue("name", (selIts?.Full_Name as string | undefined) ?? selectedChoice.name ?? "");
      setValue("fmbTakhmeenId", selectedChoice?.fmbTakhmeenCurrent?.id ?? null);
      setValue("hijriYearStart", selectedChoice?.fmbTakhmeenCurrent?.hijriYearStart ?? "");
      const hofIts = householdItsFromChoice(selectedChoice);
      setValue("beneficiaryItsNo", hofIts);
    } else {
      setValue("beneficiaryItsNo", "");
      setValue("fmbTakhmeenId", null);
      setValue("hijriYearStart", "");
      setValue("name", "");
    }
  }, [selectedChoice, setValue]);

  return <AutocompleteInput {...props} size="small" />;
};
