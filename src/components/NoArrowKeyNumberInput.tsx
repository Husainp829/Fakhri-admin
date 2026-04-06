import React, { type ComponentProps } from "react";
import { TextInput } from "react-admin";

export type NoArrowKeyNumberInputProps = ComponentProps<typeof TextInput>;

const NoArrowKeyNumberInput = (props: NoArrowKeyNumberInputProps) => (
  <TextInput
    {...props}
    type="text"
    slotProps={{
      htmlInput: {
        inputMode: "numeric",
        pattern: "[0-9]*",
        onInput: (e: React.FormEvent<HTMLInputElement>) => {
          const t = e.currentTarget;
          t.value = t.value.replace(/[^0-9]/g, "");
        },
      },
    }}
    parse={(v) => {
      if (v === "" || v === undefined || v === null) return 0;
      return Number(v);
    }}
    format={(v) => (v == null ? "" : String(v))}
  />
);

export default NoArrowKeyNumberInput;
