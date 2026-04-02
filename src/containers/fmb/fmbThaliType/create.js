import React from "react";
import { Create } from "react-admin";

import { FmbThaliTypeForm } from "./form";

export default function FmbThaliTypeCreate(props) {
  return (
    <Create {...props} redirect="list">
      <FmbThaliTypeForm />
    </Create>
  );
}
