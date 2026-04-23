import {
  CreateButton,
  DatagridConfigurable as Datagrid,
  DateInput,
  ExportButton,
  FilterButton,
  FunctionField,
  List,
  Pagination,
  SelectColumnsButton,
  ShowButton,
  TextField,
  TextInput,
  TopToolbar,
  type RaRecord,
} from "react-admin";
import { formatListDate } from "@/utils/date-format";
import { useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { slotNameMap } from "@/constants";
import { exportToExcel } from "@/utils/export-to-excel";
import { HallBookingsViewToggle } from "./HallBookingsViewToggle";

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
    formatter: (_rec: RaRecord, v: unknown) => (v ? formatListDate(v as string) : ""),
  },
  {
    header: "Slot",
    field: (rec: RaRecord) =>
      typeof rec.slot !== "undefined" ? (slotNameMap[String(rec.slot)] ?? rec.slot) : "",
    width: 12,
  },
];

const exportBookings = (records: RaRecord[]): void => {
  exportToExcel(columns, records, { filenamePrefix: "bookings", sheetName: "Bookings" });
};

export const HallBookingsListView = () => {
  const theme = useTheme();

  const BookingFilters = [
    <TextInput
      label="Search By Organiser, ItsNo, Booking No"
      source="search"
      alwaysOn
      key={0}
      sx={{ minWidth: 300 }}
      resettable
    />,
    <DateInput source="start" label="from" alwaysOn key={1} />,
    <DateInput source="end" label="to" alwaysOn key={2} />,
  ];

  const ListActions = () => (
    <TopToolbar sx={{ justifyContent: "start", alignItems: "center" }}>
      <FilterButton />
      <SelectColumnsButton />
      <ExportButton />
      <CreateButton />
      <HallBookingsViewToggle hideCreateButton />
    </TopToolbar>
  );

  return (
    <>
      <List
        exporter={exportBookings}
        pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
        filters={BookingFilters}
        actions={<ListActions />}
        sort={{ field: "updatedAt", order: "DESC" }}
        title={false}
      >
        <Datagrid
          rowClick={false}
          bulkActionButtons={false}
          rowSx={(record) => {
            const b = record.booking as
              | { paidAmount?: number; depositPaidAmount?: number }
              | undefined;
            const haPaidSomething = (b?.paidAmount ?? 0) + (b?.depositPaidAmount ?? 0) > 0;
            return {
              bgcolor: haPaidSomething
                ? alpha(theme.palette.primary.main, 0.06)
                : alpha(theme.palette.error.main, 0.1),
              "&&:hover": {
                bgcolor: haPaidSomething
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.error.main, 0.16),
              },
            };
          }}
        >
          <TextField source="booking.bookingNo" label="Booking No" />
          <TextField source="booking.organiser" label="Organiser" />
          <TextField source="booking.itsNo" label="ITS No." />
          <TextField source="booking.phone" label="Phone" />

          <FunctionField
            label="Date"
            source="date"
            render={(record: RaRecord) =>
              record?.date ? <span>{formatListDate(record.date as string)}</span> : <span>—</span>
            }
          />
          <TextField source="hall.name" label="Hall" />
          <FunctionField
            label="Slot"
            source="slot"
            render={(record) => slotNameMap[String(record.slot)]}
          />

          <FunctionField
            label="Submitter"
            source="booking.submitter"
            render={(record) => {
              const booking = record.booking as { submitter?: { name?: string } } | undefined;
              return <span>{booking?.submitter?.name}</span>;
            }}
          />
          <FunctionField
            label="Show"
            source=""
            render={(record) => (
              <ShowButton
                resource="bookings"
                record={{ id: record.bookingId as string | number }}
              />
            )}
          />
        </Datagrid>
      </List>
    </>
  );
};

export default HallBookingsListView;
