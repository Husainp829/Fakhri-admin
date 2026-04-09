import { BooleanInput, Edit, FormTab, TabbedForm, TextInput, type EditProps } from "react-admin";

import AssignmentsTab from "./tabs/AssignmentsTab";
import FmbDistributorPortalAdminTab from "./tabs/FmbDistributorPortalAdminTab";

export default function FmbThaliDistributorEdit(props: EditProps) {
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
        <FormTab label="Portal login">
          <FmbDistributorPortalAdminTab />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
}
