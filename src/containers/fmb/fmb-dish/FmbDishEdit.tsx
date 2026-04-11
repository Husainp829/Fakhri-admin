import React from "react";
import { DeleteButton, Edit, SaveButton, Toolbar, type EditProps } from "react-admin";

import { FmbDishForm, transformFmbDishPayload } from "./FmbDishForm";

const EditToolbar = () => (
  <Toolbar>
    <SaveButton />
    <DeleteButton mutationMode="pessimistic" />
  </Toolbar>
);

export default function FmbDishEdit(props: EditProps) {
  return (
    <Edit {...props} mutationMode="pessimistic" transform={transformFmbDishPayload}>
      <FmbDishForm toolbar={<EditToolbar />} />
    </Edit>
  );
}
