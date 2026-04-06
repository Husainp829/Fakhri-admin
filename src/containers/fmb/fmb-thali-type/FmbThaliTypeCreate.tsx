import React from "react";
import { Create, type CreateProps } from "react-admin";

import { FmbThaliTypeForm } from "./FmbThaliTypeForm";

export default function FmbThaliTypeCreate(props: CreateProps) {
  return (
    <Create {...props} redirect="list">
      <FmbThaliTypeForm />
    </Create>
  );
}
