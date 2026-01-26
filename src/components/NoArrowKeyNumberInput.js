/* eslint-disable consistent-return */
import React from "react";
import { TextInput } from "react-admin";

const NoArrowKeyNumberInput = (props) => (
  <TextInput
    {...props}
    type="text" // <-- text, not number
    inputMode="numeric" // mobile shows numeric keyboard
    pattern="[0-9]*" // hint for browsers
    onInput={(e) => {
      // Strip all non-digit chars
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
    }}
    parse={(v) => {
      if (v === "" || v === undefined || v === null) return 0;
      return Number(v);
    }}
    format={(v) => (v == null ? "" : String(v))}
  />
);

export default NoArrowKeyNumberInput;
