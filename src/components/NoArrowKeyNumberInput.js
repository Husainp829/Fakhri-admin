import React from "react";
import { NumberInput } from "react-admin";

const NoArrowKeyNumberInput = (props) => (
  <NumberInput
    {...props}
    onKeyDown={(e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault(); // block value change
      }
    }}
  />
);

export default NoArrowKeyNumberInput;
