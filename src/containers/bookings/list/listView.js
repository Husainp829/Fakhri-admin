import React from "react";
import {
  DatagridConfigurable as Datagrid,
  DateField,
  FilterButton,
  FunctionField,
  List,
  NumberField,
  Pagination,
  SelectColumnsButton,
  ShowButton,
  TextField,
  TextInput,
  TopToolbar,
  WrapperField,
} from "react-admin";

export default () => {
  const BookingFilters = [
    <TextInput
      label="Search By Organiser, ItsNo, Booking No"
      source="search"
      alwaysOn
      key={0}
      sx={{ minWidth: 500 }}
    />,
  ];

  const ListActions = () => (
    <TopToolbar sx={{ justifyContent: "start" }}>
      <FilterButton />
      <SelectColumnsButton />
    </TopToolbar>
  );

  return (
    <>
      <List
        pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
        filters={BookingFilters}
        actions={<ListActions />}
        sort={{ field: "updatedAt", order: "DESC" }}
      >
        <Datagrid rowClick="show" bulkActionButtons={false}>
          <TextField source="bookingNo" />
          <TextField source="organiser" label="Organiser" />
          <TextField source="itsNo" label="ITS No." />
          <TextField source="phone" label="Phone" />

          <NumberField source="paidAmount" textAlign="left" />
          <NumberField source="depositPaidAmount" textAlign="left" />

          <FunctionField
            label="Submitter"
            source="submitter"
            render={(record) => <span>{record?.admin?.name || record.submitter}</span>}
          />
          <DateField source="checkedOutOn" />
          <DateField source="refundReturnedOn" />
          <WrapperField source="Show">
            <ShowButton />
          </WrapperField>
        </Datagrid>
      </List>
    </>
  );
};
