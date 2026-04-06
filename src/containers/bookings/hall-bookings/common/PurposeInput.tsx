import type { ComponentProps } from "react";
import { useEffect } from "react";
import { SelectInput, useChoicesContext } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

export const PurposeInput = (props: ComponentProps<typeof SelectInput>) => {
  const { selectedChoices = [] } = useChoicesContext();
  const { setValue } = useFormContext();
  const type = useWatch({ name: "purpose" });
  const selectedChoice = selectedChoices[0] as { id?: string; perThaal?: number } | undefined;

  useEffect(() => {
    if (selectedChoice?.id) {
      setValue("perThaalCost", selectedChoice.perThaal);
    }
  }, [selectedChoice, type, setValue]);

  return <SelectInput {...props} size="small" />;
};
