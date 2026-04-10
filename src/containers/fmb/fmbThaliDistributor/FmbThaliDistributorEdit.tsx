import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import { BooleanInput, Edit, FormTab, TabbedForm, TextInput, type EditProps } from "react-admin";

import { AssignmentsTabCountProvider, useAssignmentsTabTotal } from "./AssignmentsTabCountContext";
import AssignmentsTab from "./tabs/AssignmentsTab";
import FmbDistributorPortalAdminTab from "./tabs/FmbDistributorPortalAdminTab";

function AssignedThalisTabLabel() {
  const total = useAssignmentsTabTotal();
  return (
    <Badge badgeContent={total} color="primary" max={999999} showZero>
      <Box component="span" sx={{ pr: 2, display: "inline-block" }}>
        Assigned thalis
      </Box>
    </Badge>
  );
}

export default function FmbThaliDistributorEdit(props: EditProps) {
  return (
    <Edit {...props} title="Edit thali distributor">
      <AssignmentsTabCountProvider>
        <TabbedForm>
          <FormTab label="Basic">
            <TextInput source="code" fullWidth />
            <TextInput source="name" fullWidth />
            <TextInput source="phone" fullWidth />
            <BooleanInput source="isActive" />
            <TextInput source="remarks" fullWidth multiline />
          </FormTab>
          <FormTab label={<AssignedThalisTabLabel />}>
            <AssignmentsTab />
          </FormTab>
          <FormTab label="Portal login">
            <FmbDistributorPortalAdminTab />
          </FormTab>
        </TabbedForm>
      </AssignmentsTabCountProvider>
    </Edit>
  );
}
