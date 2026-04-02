import React from "react";
import { BooleanInput, Edit, TabbedForm, FormTab, TextInput } from "react-admin";

import AssignmentsTab from "./tabs/assignmentsTab";

export default function FmbThaliDistributorEdit(props) {
  return (
    <Edit {...props} title="Edit thali distributor">
      <TabbedForm>
        <FormTab label="Basic">
          <TextInput source="code" fullWidth />
          <TextInput source="name" fullWidth />
          <TextInput source="phone" fullWidth />
          <BooleanInput source="isActive" />
          <TextInput source="remarks" fullWidth multiline />
        </FormTab>
        <FormTab label="Assigned thalis">
          <AssignmentsTab />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
}
