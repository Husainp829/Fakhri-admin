import React from "react";
import { NumericFormat } from "react-number-format";

function Nf({ value }) {
  return (
    <NumericFormat type="text" value={value} thousandsGroupStyle="lakh" thousandSeparator="," />
  );
}

export default Nf;
