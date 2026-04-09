import React from "react";
import { DeleteButton, Edit, SaveButton, Toolbar, type EditProps } from "react-admin";

import { FmbDailyMenuForm, transformFmbDailyMenuPayload } from "./FmbDailyMenuForm";

const EditToolbar = () => (
  <Toolbar>
    <SaveButton />
    <DeleteButton mutationMode="pessimistic" confirmTitle="Remove this daily menu?" />
  </Toolbar>
);

export default function FmbDailyMenuEdit(props: EditProps) {
  return (
    <Edit {...props} mutationMode="pessimistic" transform={transformFmbDailyMenuPayload}>
      <FmbDailyMenuForm toolbar={<EditToolbar />} />
    </Edit>
  );
}
