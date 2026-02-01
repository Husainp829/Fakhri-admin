import React from "react";
import {
  Button,
  CreateButton,
  DatagridConfigurable as Datagrid,
  EditButton,
  ExportButton,
  FilterButton,
  FunctionField,
  List,
  NumberField,
  Pagination,
  SelectColumnsButton,
  SelectInput,
  SimpleList,
  TextField,
  TextInput,
  TopToolbar,
  WrapperField,
  usePermissions,
  useStore,
} from "react-admin";
import { Box, useMediaQuery } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { downLoadPasses } from "../../../utils";
import { MARKAZ_LIST } from "../../../constants";
import { hasPermission } from "../../../utils/permissionUtils";
import { exportToExcel } from "../../../utils/exportToExcel";

export default () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  const NiyaazFilters = [
    <TextInput
      label="Search By HOF Name, HOF ITS, Form No"
      source="search"
      alwaysOn
      key={0}
      sx={{ minWidth: 400 }}
    />,
    <SelectInput
      label="Jaman Venue"
      source="markaz"
      key={1}
      choices={Object.entries(MARKAZ_LIST).map(([id, name]) => ({ id, name }))}
      alwaysOn
    />,
    <SelectInput
      label="Namaaz Venue"
      source="namaazVenue"
      key={1}
      choices={Object.entries(MARKAZ_LIST).map(([id, name]) => ({ id, name }))}
      alwaysOn
    />,
  ];
  const { permissions } = usePermissions();

  const ListActions = () => (
    <TopToolbar sx={{ justifyContent: "start" }}>
      <FilterButton />
      <SelectColumnsButton />
      {hasPermission(permissions, "niyaaz.create") && <CreateButton />}
      {hasPermission(permissions, "niyaaz.export") && <ExportButton />}
    </TopToolbar>
  );

  const [currentEvent] = useStore("currentEvent", null);

  const exporter = (niyaaz) => {
    const niyaazColumns = [
      {
        header: "Form No",
        field: "formNo",
        width: 15,
      },
      {
        header: "Markaz",
        field: "markaz",
        width: 15,
      },
      {
        header: "Namaaz Venue",
        field: "namaazVenue",
        width: 15,
      },
      {
        header: "HOF ID",
        field: "HOFId",
        width: 15,
      },
      {
        header: "HOF Name",
        field: "HOFName",
        width: 30,
      },
      {
        header: "Mobile",
        field: "HOFPhone",
        width: 15,
      },
      {
        header: "Total Payable",
        field: "totalPayable",
        width: 15,
      },
      {
        header: "Paid Amount",
        field: "paidAmount",
        width: 15,
      },
      {
        header: "Balance",
        field: "balance",
        width: 15,
      },
      {
        header: "Submitter",
        field: (rec) => rec?.admin?.name || rec.submitter || "",
        width: 20,
      },
    ];

    return exportToExcel(niyaazColumns, niyaaz, {
      filenamePrefix: "niyaaz",
      sheetName: "Niyaaz",
    });
  };

  return (
    <>
      <List
        pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
        filters={NiyaazFilters}
        actions={<ListActions />}
        sort={{ field: "updatedAt", order: "DESC" }}
        exporter={exporter}
      >
        {isSmall ? (
          <SimpleList
            primaryText={(record) => record.formNo}
            secondaryText={(record) => (
              <>
                {record.HOFName} · {record.HOFId}
                <br />₹{Number(record.totalPayable || 0).toLocaleString("en-IN")} · Paid ₹
                {Number(record.paidAmount || 0).toLocaleString("en-IN")} · Bal ₹
                {Number(record.balance || 0).toLocaleString("en-IN")}
              </>
            )}
            tertiaryText={(record) => record.markaz || "—"}
            linkType="show"
            rowSx={() => ({ borderBottom: "1px solid #e0e0e0" })}
          />
        ) : (
          <Box sx={{ overflowX: "auto", width: "100%" }}>
            <Datagrid rowClick="show" bulkActionButtons={false} sx={{ minWidth: 1000 }}>
              <WrapperField source="EDIT">
                <EditButton />
              </WrapperField>
              <TextField source="formNo" />
              <TextField source="markaz" />
              <TextField source="namaazVenue" />
              <TextField source="HOFId" label="HOF ID" />
              <TextField source="HOFName" label="HOF Name" />
              <TextField source="HOFPhone" label="HOF Phone" />
              <NumberField source="totalPayable" label="Total Payable" textAlign="left" />
              <NumberField source="paidAmount" textAlign="left" />
              <NumberField source="balance" label="Balance" textAlign="left" />
              <FunctionField
                label="Submitter"
                source="submitter"
                render={(record) => <span>{record?.admin?.name || record.submitter}</span>}
              />
              <FunctionField
                label="Download"
                source="updatedAt"
                render={(record) => (
                  <Button onClick={() => downLoadPasses({ ...record, event: currentEvent })}>
                    <DownloadIcon />
                  </Button>
                )}
                key="name"
              />
            </Datagrid>
          </Box>
        )}
      </List>
    </>
  );
};
