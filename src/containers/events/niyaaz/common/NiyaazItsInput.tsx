import { useEffect } from "react";
import { AutocompleteInput, useChoicesContext } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import type { ComponentProps } from "react";

export const ITSInput = (props: ComponentProps<typeof AutocompleteInput>) => {
  const { selectedChoices = [] } = useChoicesContext();
  const { setValue } = useFormContext();
  const type = useWatch({ name: "sabilType" });
  const selectedChoice = selectedChoices[0] as Record<string, unknown> | undefined;

  useEffect(() => {
    if (!selectedChoice) return;
    const id = selectedChoice.id;
    if (id != null) {
      setValue("name", selectedChoice.Full_Name as string);
      setValue("area", selectedChoice.Area as string);
      setValue("masool", selectedChoice.Sector_Incharge_Name as string);
      setValue("mohallah", selectedChoice.Jamaat as string);
      setValue("mobile", selectedChoice.Mobile as string);
      if (type === "CHULA") {
        setValue("address", selectedChoice.Address as string);
      }
    }
  }, [selectedChoice, setValue, type]);

  return <AutocompleteInput {...props} size="small" />;
};
