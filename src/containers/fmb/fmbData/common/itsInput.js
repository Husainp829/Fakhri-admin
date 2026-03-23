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

export const ITSInput = (props) => {
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const selectedChoice = selectedChoices[0];

  useEffect(() => {
    if (selectedChoice?.id) {
      setValue("name", itsField(selectedChoice, "Full_Name") ?? selectedChoice.name ?? null);
      setValue("area", itsField(selectedChoice, "Area"));
      setValue("masool", itsField(selectedChoice, "Sector_Incharge_Name"));
      setValue("mohallah", itsField(selectedChoice, "Jamaat") ?? selectedChoice.mohallah ?? null);
      setValue("mobileNo", itsField(selectedChoice, "Mobile"));
      setValue("address", itsField(selectedChoice, "Address") ?? selectedChoice.address ?? null);
    } else {
      setValue("name", null);
      setValue("area", null);
      setValue("masool", null);
      setValue("mohallah", null);
      setValue("mobileNo", null);
      setValue("address", null);
    }
  }, [selectedChoice, setValue]);

  return <AutocompleteInput {...props} size="small" />;
};
