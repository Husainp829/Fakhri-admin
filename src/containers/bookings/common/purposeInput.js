/* eslint-disable no-console */
import React, { useEffect } from "react";
import { SelectInput, useChoicesContext } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

export const PurposeInput = (props) => {
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const type = useWatch({ name: "purpose" });
  const selectedChoice = selectedChoices[0];

  useEffect(() => {
    if (selectedChoice?.id) {
      setValue("jamaatLagatUnit", selectedChoice.jamaatLagat);
      setValue("perThaalCost", selectedChoice.perThaal);
    }
  }, [selectedChoice, type]);

  return <SelectInput {...props} size="small" />;
};
