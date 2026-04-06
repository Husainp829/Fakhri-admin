import type { ListProps } from "react-admin";
import { List, Datagrid, TextField, SelectInput } from "react-admin";
import { EMPLOYEE_TYPE } from "@/constants";

const StaffList = (props: ListProps) => {
  const RegistrationFilters = [
    <SelectInput
      label="Type"
      source="type"
      key={1}
      choices={Object.entries(EMPLOYEE_TYPE).map(([id, name]) => ({ id, name }))}
      sx={{ marginBottom: 0 }}
      alwaysOn
    />,
  ];
  return (
    <List {...props} filters={RegistrationFilters}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="type" />
        <TextField source="name" />
        <TextField source="phone" />
      </Datagrid>
    </List>
  );
};

export default StaffList;
