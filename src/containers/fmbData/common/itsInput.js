/* eslint-disable no-console */
import React, { useEffect } from "react";
import { AutocompleteInput, useChoicesContext } from "react-admin";
import { useFormContext } from "react-hook-form";

export const ITSInput = (props) => {
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const selectedChoice = selectedChoices[0];

  useEffect(() => {
    if (selectedChoice?.id) {
      setValue("name", selectedChoice.Full_Name);
      setValue("area", selectedChoice.Area);
      setValue("masool", selectedChoice.Sector_Incharge_Name);
      setValue("mohallah", selectedChoice.Jamaat);
      setValue("mobile", selectedChoice.Mobile);
      setValue("address", selectedChoice.Address);
    }
  }, [selectedChoice]);

  return <AutocompleteInput {...props} size="small" />;
};
