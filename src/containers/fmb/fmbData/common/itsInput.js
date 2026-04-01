/* eslint-disable no-console */
import React, { useEffect } from "react";
import { AutocompleteInput, useChoicesContext } from "react-admin";
import { useFormContext } from "react-hook-form";

/** Choice is either a hydrated fmbData row (`itsdata`) or a raw itsdata row from `reference="itsData"`. */
function itsField(choice, field) {
  if (!choice) return null;
  const nested = choice.itsdata;
  if (nested != null && nested[field] != null && nested[field] !== "") {
    return nested[field];
  }
  return choice[field] ?? null;
}

function normalizeString(v) {
  if (v == null) return "";
  return String(v).trim();
}

export const ITSInput = (props) => {
  const { selectedChoices } = useChoicesContext();
  const { setValue, getValues } = useFormContext();
  const selectedChoice = selectedChoices[0];
  console.log({ selectedChoices, itsField: getValues("itsNo") });

  useEffect(() => {
    if (selectedChoice?.id) {
      setValue("name", itsField(selectedChoice, "Full_Name") ?? selectedChoice.name ?? null);
      setValue("mobileNo", itsField(selectedChoice, "Mobile"));

      // Default thali delivery address from ITS (only when empty; never overwrite user edits)
      const itsAddress = normalizeString(itsField(selectedChoice, "Address"));
      if (itsAddress) {
        const thalis = getValues("thalis");
        if (Array.isArray(thalis)) {
          thalis.forEach((thali, idx) => {
            const current = normalizeString(thali?.deliveryAddress);
            if (!current) {
              setValue(`thalis.${idx}.deliveryAddress`, itsAddress, { shouldDirty: true });
            }
          });
        }
      }
    } else {
      setValue("name", null);
      setValue("mobileNo", null);
    }
  }, [selectedChoice, setValue]);

  return <AutocompleteInput {...props} size="small" />;
};
