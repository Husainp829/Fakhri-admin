import React from "react";
import { DeleteButton, Edit, SaveButton, Toolbar, type EditProps } from "react-admin";

import { FmbThaliTypeForm } from "./FmbThaliTypeForm";

const EditToolbar = () => (
  <Toolbar>
    <SaveButton />
    <DeleteButton mutationMode="pessimistic" />
  </Toolbar>
);

export default function FmbThaliTypeEdit(props: EditProps) {
  return (
    <Edit {...props} mutationMode="pessimistic">
      <FmbThaliTypeForm toolbar={<EditToolbar />} />
    </Edit>
  );
}
