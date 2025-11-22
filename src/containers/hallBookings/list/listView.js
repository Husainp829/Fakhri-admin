import React from "react";
import {
  DatagridConfigurable as Datagrid,
  DateField,
  DateInput,
  FilterButton,
  FunctionField,
  List,
  Pagination,
  SelectColumnsButton,
  ShowButton,
  TextField,
  TextInput,
  TopToolbar,
} from "react-admin";
import { slotNameMap } from "../../../constants";

export default () => {
  const BookingFilters = [
    <TextInput
      label="Search By Organiser, ItsNo, Booking No"
      source="search"
      alwaysOn
      key={0}
      sx={{ minWidth: 500 }}
      resettable
    />,
    <DateInput source="start" label="from" alwaysOn key={1} resettable />,
    <DateInput source="end" label="to" alwaysOn key={2} resettable />,
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
        <Datagrid
          rowClick={false}
          bulkActionButtons={false}
          rowSx={(record) => {
            const haPaidSomething =
              record.booking.paidAmount + record.booking.depositPaidAmount > 0;
            return {
              backgroundColor: haPaidSomething ? "#ffffff55" : "#ff000055",
              "&&:hover": {
                backgroundColor: haPaidSomething ? "#00000011" : "#ff000066", // darker red on hover
              },
            };
          }}
        >
          <TextField source="booking.bookingNo" label="Booking No" />
          <TextField source="booking.organiser" label="Organiser" />
          <TextField source="booking.itsNo" label="ITS No." />
          <TextField source="booking.phone" label="Phone" />

          <DateField
            source="date"
            locales="en-IN"
            options={{
              day: "2-digit",
              month: "short",
              year: "numeric",
            }}
          />
          <TextField source="hall.name" label="Hall" />
          <FunctionField label="Slot" source="slot" render={(record) => slotNameMap[record.slot]} />

          <FunctionField
            label="Submitter"
            source="booking.submitter"
            render={(record) => (
              <span>{record?.booking?.admin?.name || record.booking?.submitter}</span>
            )}
          />
          <FunctionField
            label="Show"
            source=""
            render={(record) => (
              <ShowButton resource="bookings" record={{ id: record.bookingId }} />
            )}
          />
        </Datagrid>
      </List>
    </>
  );
};
