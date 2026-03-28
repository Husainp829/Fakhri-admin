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
import { slotNameMap } from "../../../../constants";
import { exportToExcel } from "../../../../utils/exportToExcel";
import ViewToggle from "./viewToggle";

const columns = [
  {
    header: "Date",
    field: "date",
    width: 14,
    formatter: (rec, v) => (v ? dayjs(v).format("DD-MMM-YYYY") : ""),
  },
  { header: "Type", field: "type", width: 14 },
  {
    header: "Slot",
    field: (rec) =>
      typeof rec.slot !== "undefined" ? slotNameMap[rec.slot] ?? rec.slot : "",
    width: 12,
  },
  { header: "Host ITS", field: "hostItsNo", width: 12 },
  { header: "Host name", field: "hostName", width: 28 },
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
        <Datagrid rowClick={false} bulkActionButtons={false}>
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
            label="Slot"
            source="slot"
            render={(record) => slotNameMap[record.slot] ?? record.slot ?? ""}
          />
          <TextField source="hostItsNo" label="Host ITS" />
          <TextField source="hostName" label="Host name" />
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
