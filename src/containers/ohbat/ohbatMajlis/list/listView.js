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
  TextField,
  TopToolbar,
} from "react-admin";
import dayjs from "dayjs";
import { formatMajlisStartTimeLabel } from "../ohbatMajlisTime";
import { exportToExcel } from "../../../../utils/exportToExcel";
import ViewToggle from "./viewToggle";
import { majlisHasSadarat, missingSadaratBorderLeft } from "./missingSadaratHighlight";

const columns = [
  {
    header: "Date",
    field: "date",
    width: 14,
    formatter: (rec, v) => (v ? dayjs(v).format("DD-MMM-YYYY") : ""),
  },
  { header: "Type", field: "type", width: 14 },
  {
    header: "Time",
    field: (rec) => formatMajlisStartTimeLabel(rec.startTime),
    width: 12,
  },
  { header: "Host ITS", field: "hostItsNo", width: 12 },
  { header: "Host name", field: "hostName", width: 24 },
  { header: "Host sector", field: "hostSector", width: 22 },
  { header: "Host sub-sector", field: "hostSubSector", width: 22 },
  { header: "Sadarat", field: (rec) => rec.sadarat?.name ?? "", width: 24 },
  {
    header: "Khidmatguzar",
    field: (rec) => rec.khidmatguzar?.Full_Name ?? rec.khidmatguzarItsNo ?? "",
    width: 28,
  },
  { header: "Contact", field: "mobileNo", width: 14 },
];

const exportOhbatMajlis = (records) =>
  exportToExcel(columns, records, {
    filenamePrefix: "ohbat-majlis",
    sheetName: "Ohbat majlis",
  });

export default () => {
  const OhbatMajlisFilters = [
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
        exporter={exportOhbatMajlis}
        pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
        filters={OhbatMajlisFilters}
        actions={<ListActions />}
        sort={{ field: "date", order: "DESC" }}
        title={false}
      >
        <Datagrid
          rowClick={false}
          bulkActionButtons={false}
          sx={{ minWidth: 1280 }}
          rowSx={(record) =>
            !majlisHasSadarat(record) ? { borderLeft: missingSadaratBorderLeft } : undefined
          }
        >
          <DateField
            source="date"
            locales="en-IN"
            options={{
              day: "2-digit",
              month: "short",
              year: "numeric",
            }}
          />
          <TextField source="type" />
          <FunctionField
            label="Time"
            source="startTime"
            render={(record) => formatMajlisStartTimeLabel(record.startTime)}
          />
          <TextField source="hostItsNo" label="Host ITS" />
          <TextField source="hostName" label="Host name" emptyText="—" />
          <TextField source="hostSector" label="Sector" emptyText="—" />
          <TextField source="hostSubSector" label="Sub-sector" emptyText="—" />
          <FunctionField label="Sadarat" render={(r) => r?.sadarat?.name || "—"} />
          <FunctionField
            label="Khidmatguzar"
            render={(r) => r?.khidmatguzar?.Full_Name || r?.khidmatguzarItsNo || "—"}
          />
          <TextField source="mobileNo" label="Contact" />
          <FunctionField
            label="Show"
            source=""
            render={(record) => <ShowButton resource="ohbatMajalis" record={record} />}
          />
        </Datagrid>
      </List>
    </>
  );
};
