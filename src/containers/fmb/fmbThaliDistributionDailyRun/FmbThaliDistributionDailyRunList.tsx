import { useMemo } from "react";
import { Datagrid, List, TextField, TextInput, type ListProps } from "react-admin";

const filters = [<TextInput key="date" source="date" label="Date (YYYY-MM-DD)" alwaysOn />];

export default function FmbThaliDistributionDailyRunList(props: ListProps) {
  const filterDefaultValues = useMemo(() => ({ date: new Date().toISOString().slice(0, 10) }), []);

  return (
    <List
      {...props}
      title="Daily thali distribution"
      perPage={50}
      filterDefaultValues={filterDefaultValues}
      filters={filters}
      sort={{ field: "code", order: "ASC" }}
      exporter={false}
      pagination={false}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source="code" label="Distributor Code" />
        <TextField source="name" label="Distributor" />
        <TextField source="total" />
        <TextField source="allotted" />
        <TextField source="delivered" />
        <TextField source="failed" />
        <TextField source="returned" />
      </Datagrid>
    </List>
  );
}
