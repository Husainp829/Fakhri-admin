import React, { useEffect } from "react";
import { AutocompleteInput, useChoicesContext } from "react-admin";
import { useFormContext } from "react-hook-form";

/** ITS for the FMB household (HOF), from list/choice payload */
function householdItsFromChoice(choice) {
  if (!choice) return "";
  const raw = choice.itsNo ?? choice.itsdata?.ITS_ID ?? null;
  if (raw == null || raw === "") return "";
  return String(raw).trim();
}

export const ITSInput = (props) => {
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const selectedChoice = selectedChoices[0];

  useEffect(() => {
    if (selectedChoice?.id) {
      setValue("name", selectedChoice?.itsdata?.Full_Name ?? selectedChoice.name ?? "");
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
