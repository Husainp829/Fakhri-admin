import React from "react";
import { DeleteButton, Edit, SaveButton, Toolbar } from "react-admin";

import { FmbThaliTypeForm } from "./form";

const EditToolbar = () => (
  <Toolbar>
    <SaveButton />
    <DeleteButton mutationMode="pessimistic" />
  </Toolbar>
);

export default function FmbThaliTypeEdit(props) {
  return (
    <Edit {...props} mutationMode="pessimistic">
      <FmbThaliTypeForm toolbar={<EditToolbar />} />
    </Edit>
  );
}
