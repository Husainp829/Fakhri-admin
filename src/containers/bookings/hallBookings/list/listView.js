// BookingListWithExcelExport.jsx
import React from "react";
import {
  CreateButton,
  DatagridConfigurable as Datagrid,
  DateField,
  DateInput,
  ExportButton,
  FilterButton,
  FunctionField,
  List,
  Pagination,
  SelectColumnsButton,
  ShowButton,
  SimpleList,
  TextField,
  TextInput,
  TopToolbar,
} from "react-admin";
import { useMediaQuery } from "@mui/material";
import dayjs from "dayjs";
import { slotNameMap } from "../../../../constants";
import { exportToExcel } from "../../../../utils/exportToExcel";
import ViewToggle from "./viewToggle";

const columns = [
  { header: "Booking No", field: "booking.bookingNo", width: 18 },
  { header: "Organiser", field: "booking.organiser", width: 30 },
  { header: "ITS No.", field: "booking.itsNo", width: 12 },
  { header: "Phone", field: "booking.phone", width: 15 },
  { header: "Hall", field: "hall.name", width: 25 },
  {
    header: "Date",
    field: "date",
    width: 14,
    formatter: (rec, v) => (v ? dayjs(v).format("DD-MMM-YYYY") : ""),
  },
  {
    header: "Slot",
    // field can be function to map slot index to readable name
    field: (rec) => (typeof rec.slot !== "undefined" ? slotNameMap[rec.slot] ?? rec.slot : ""),
    width: 12,
  },
];

// react-admin exporter (exports the records passed by react-admin)
const exportBookings = (records) =>
  exportToExcel(columns, records, { filenamePrefix: "bookings", sheetName: "Bookings" });

export default () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });

  const BookingFilters = [
    <TextInput
      label="Search By Organiser, ItsNo, Booking No"
      source="search"
      alwaysOn
      key={0}
      sx={{ minWidth: 300 }}
      resettable
    />,
    <DateInput source="start" label="from" alwaysOn key={1} resettable />,
    <DateInput source="end" label="to" alwaysOn key={2} resettable />,
  ];

  const ListActions = () => (
    <TopToolbar sx={{ justifyContent: "start", alignItems: "center" }}>
      <FilterButton />
      <SelectColumnsButton />
      <ExportButton />
      <CreateButton />
      <ViewToggle hideCreateButton />
    </TopToolbar>
  );

  return (
    <>
      <List
        exporter={exportBookings} // <- wire the exporter here
        pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
        filters={BookingFilters}
        actions={<ListActions />}
        sort={{ field: "updatedAt", order: "DESC" }}
        title={false}
      >
        {isSmall ? (
          <SimpleList
            primaryText={(record) =>
              `${record.booking?.bookingNo ?? ""} · ${record.booking?.organiser ?? ""}`
            }
            secondaryText={(record) => (
              <>
                {record.hall?.name ?? "—"} ·{" "}
                {record.date ? dayjs(record.date).format("DD-MMM-YYYY") : ""}
                <br />
                {slotNameMap[record.slot] ?? record.slot ?? "—"} · {record.booking?.phone ?? "—"}
              </>
            )}
            tertiaryText={(record) => record.booking?.itsNo ?? "—"}
            linkType="show"
            rowSx={(record) => {
              const haPaidSomething =
                (record.booking?.paidAmount ?? 0) + (record.booking?.depositPaidAmount ?? 0) > 0;
              return {
                borderBottom: "1px solid #e0e0e0",
                backgroundColor: haPaidSomething ? "#ffffff55" : "#ff000055",
              };
            }}
          />
        ) : (
          <Datagrid
            rowClick={false}
            bulkActionButtons={false}
            rowSx={(record) => {
              const haPaidSomething =
                record.booking.paidAmount + record.booking.depositPaidAmount > 0;
              return {
                backgroundColor: haPaidSomething ? "#ffffff55" : "#ff000055",
                "&&:hover": {
                  backgroundColor: haPaidSomething ? "#00000011" : "#ff000066",
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
            <FunctionField
              label="Slot"
              source="slot"
              render={(record) => slotNameMap[record.slot]}
            />

            <FunctionField
              label="Submitter"
              source="booking.submitter"
              render={(record) => <span>{record.booking?.submitter?.name}</span>}
            />
            <FunctionField
              label="Show"
              source=""
              render={(record) => (
                <ShowButton resource="bookings" record={{ id: record.bookingId }} />
              )}
            />
          </Datagrid>
        )}
      </List>
    </>
  );
};
