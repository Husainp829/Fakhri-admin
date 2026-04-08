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
  TopToolbar,
  type Exporter,
  type RaRecord,
} from "react-admin";
import type { SxProps } from "@mui/material";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { formatMajlisStartTimeLabel } from "../OhbatMajlisTime";
import { exportToExcel } from "@/utils/export-to-excel";
import { OhbatMajlisViewToggle } from "./OhbatMajlisViewToggle";
import { majlisHasSadarat, missingSadaratBorderLeft } from "./MissingSadaratHighlight";

const columns = [
  {
    header: "Date",
    field: "date",
    width: 14,
    formatter: (rec: RaRecord, v: unknown) => (v ? dayjs(String(v)).format("DD-MMM-YYYY") : ""),
  },
  { header: "Type", field: "type", width: 14 },
  {
    header: "Time",
    field: (rec: RaRecord) => formatMajlisStartTimeLabel(rec.startTime as string | undefined),
    width: 12,
  },
  { header: "Host ITS", field: "hostItsNo", width: 12 },
  { header: "Host name", field: "hostName", width: 24 },
  { header: "Host sector", field: "hostSector", width: 22 },
  { header: "Host sub-sector", field: "hostSubSector", width: 22 },
  {
    header: "Sadarat",
    field: (rec: RaRecord) => String((rec.sadarat as { name?: string } | undefined)?.name ?? ""),
    width: 24,
  },
  {
    header: "Khidmatguzar",
    field: (rec: RaRecord) =>
      String(
        (rec.khidmatguzar as { Full_Name?: string } | undefined)?.Full_Name ??
          rec.khidmatguzarItsNo ??
          ""
      ),
    width: 28,
  },
  {
    header: "Zakereen",
    field: (rec: RaRecord) =>
      String(
        (rec.zakereen as { Full_Name?: string } | undefined)?.Full_Name ?? rec.zakereenItsNo ?? ""
      ),
    width: 28,
  },
  { header: "Contact", field: "mobileNo", width: 14 },
];

const exportOhbatMajlis = (records: RaRecord[]) =>
  exportToExcel(columns, records, {
    filenamePrefix: "ohbat-majlis",
    sheetName: "Ohbat majlis",
  });

export default function OhbatMajlisListView() {
  const theme = useTheme();
  const isNarrow = useMediaQuery((t) => t.breakpoints.down("md"), { noSsr: true });
  const sadaratMissingBorder = missingSadaratBorderLeft(theme);

  const OhbatMajlisFilters = [
    <DateInput source="start" label="from" alwaysOn key="ohbat-filter-start" />,
    <DateInput source="end" label="to" alwaysOn key="ohbat-filter-end" />,
  ];

  const ListActions = () => (
    <TopToolbar
      sx={{
        justifyContent: "flex-start",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1,
        rowGap: 1,
      }}
    >
      <FilterButton />
      {!isNarrow && <SelectColumnsButton />}
      <ExportButton />
      <CreateButton />
      <OhbatMajlisViewToggle hideCreateButton />
    </TopToolbar>
  );

  const listRowSx = (record: RaRecord): SxProps => ({
    borderBottom: 1,
    borderBottomColor: "divider",
    ...(!majlisHasSadarat(record) ? { borderLeft: sadaratMissingBorder } : {}),
  });

  return (
    <>
      <List
        exporter={exportOhbatMajlis as unknown as Exporter}
        pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
        filters={OhbatMajlisFilters}
        actions={<ListActions />}
        sort={{ field: "date", order: "DESC" }}
        title={false}
      >
        {isNarrow ? (
          <SimpleList
            rowClick="show"
            primaryText={(r) => (
              <Box sx={{ minWidth: 0, width: "100%" }}>
                <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>
                  {(r.hostName as string) || (r.hostItsNo as string) || "—"}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {r.date ? dayjs(String(r.date)).format("DD MMM YYYY") : "—"} ·{" "}
                  {(r.type as string) || "—"} · {formatMajlisStartTimeLabel(r.startTime as string)}
                </Typography>
              </Box>
            )}
            secondaryText={(r) =>
              [
                (r.sadarat as { name?: string } | undefined)?.name
                  ? `Sadarat: ${(r.sadarat as { name: string }).name}`
                  : null,
                (r.khidmatguzar as { Full_Name?: string } | undefined)?.Full_Name ||
                r.khidmatguzarItsNo
                  ? `Khidmat: ${(r.khidmatguzar as { Full_Name?: string })?.Full_Name || String(r.khidmatguzarItsNo)}`
                  : null,
                (r.zakereen as { Full_Name?: string } | undefined)?.Full_Name || r.zakereenItsNo
                  ? `Zakereen: ${(r.zakereen as { Full_Name?: string })?.Full_Name || String(r.zakereenItsNo)}`
                  : null,
                r.mobileNo ? `Contact: ${String(r.mobileNo)}` : null,
                [r.hostSector, r.hostSubSector].filter(Boolean).join(" · ") || null,
              ]
                .filter(Boolean)
                .join(" · ") || "—"
            }
            rowSx={(record, _index) => listRowSx(record)}
          />
        ) : (
          <Box sx={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <Datagrid
              rowClick={false}
              bulkActionButtons={false}
              sx={{ minWidth: 1380 }}
              rowSx={(record, _index) =>
                !majlisHasSadarat(record) ? { borderLeft: sadaratMissingBorder } : {}
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
                render={(record) => formatMajlisStartTimeLabel(record.startTime as string)}
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
              <FunctionField
                label="Zakereen"
                render={(r) => r?.zakereen?.Full_Name || r?.zakereenItsNo || "—"}
              />
              <TextField source="mobileNo" label="Contact" />
              <FunctionField
                label="Show"
                source=""
                render={(record) => <ShowButton resource="ohbatMajalis" record={record} />}
              />
            </Datagrid>
          </Box>
        )}
      </List>
    </>
  );
}
