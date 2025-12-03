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
  TextField,
  TextInput,
  TopToolbar,
  WrapperField,
  downloadCSV,
  usePermissions,
  useStore,
} from "react-admin";
import jsonExport from "jsonexport/dist";
import dayjs from "dayjs";
import DownloadIcon from "@mui/icons-material/Download";
import { calcTotalBalance, calcTotalPayable, downLoadPasses } from "../../utils";
import { MARKAZ_LIST, NAMAAZ_VENUE } from "../../constants";

export default () => {
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
      choices={Object.entries(NAMAAZ_VENUE).map(([id, name]) => ({ id, name }))}
      alwaysOn
    />,
  ];
  const { permissions } = usePermissions();

  const ListActions = () => (
    <TopToolbar sx={{ justifyContent: "start" }}>
      <FilterButton />
      <SelectColumnsButton />
      {permissions?.niyaaz?.create && <CreateButton />}
      {permissions?.niyaaz?.export && <ExportButton />}
    </TopToolbar>
  );

  const [currentEvent] = useStore("currentEvent", null);

  const exporter = (niyaaz) => {
    const niyaazForExport = niyaaz.map((niy) => {
      const {
        formNo,
        HOFId,
        HOFName,
        HOFPhone,
        takhmeenAmount,
        chairs,
        zabihat,
        iftaari,
        paidAmount,
        markaz,
        namaazVenue,
        comments,
        admin,
        submitter,
        createdAt,
      } = niy;
      return {
        formNo,
        HOFId,
        HOFName,
        HOFPhone,
        takhmeenAmount,
        chairs,
        zabihat,
        iftaari,
        totalPayable: calcTotalPayable(currentEvent, niy),
        paidAmount,
        balance: calcTotalBalance(currentEvent, niy),
        markaz,
        namaazVenue,
        comments,
        submitter: admin?.name || submitter,
        createdAt: dayjs(createdAt).format("DD/MM/YYYY"),
      };
    });
    const columnOrder = JSON.parse(
      localStorage.getItem("RaStore.preferences.niyaaz.datagrid.availableColumns") || "[]"
    );

    jsonExport(
      niyaazForExport,
      {
        headers: columnOrder.filter((c) => c.source !== "EDIT").map((c) => c.source), // order fields in the export
      },
      (err, csv) => {
        downloadCSV(csv, "NiyaazTakhmeen");
      }
    );
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
        <Datagrid rowClick="show" bulkActionButtons={false}>
          <WrapperField source="EDIT">
            <EditButton />
          </WrapperField>
          <TextField source="formNo" />
          <TextField source="markaz" />
          <TextField source="namaazVenue" />
          <TextField source="HOFId" label="HOF ID" />
          <TextField source="HOFName" label="HOF Name" />
          <TextField source="HOFPhone" label="HOF Phone" />
          <FunctionField
            label="Total Payable"
            source="totalPayable"
            render={(record) => calcTotalPayable(currentEvent, record)}
            key="name"
          />
          <NumberField source="paidAmount" textAlign="left" />
          <FunctionField
            label="Balance"
            source="balance"
            render={(record) => calcTotalBalance(currentEvent, record)}
            key="name"
          />
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
      </List>
    </>
  );
};
