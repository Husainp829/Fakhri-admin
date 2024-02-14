import React, { useContext } from "react";
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
  downloadCSV,
} from "react-admin";
import jsonExport from "jsonexport/dist";
import dayjs from "dayjs";
import DownloadIcon from "@mui/icons-material/Download";
import { calcTotalPayable, downLoadPasses } from "../../utils";
import { EventContext } from "../../dataprovider/eventProvider";
import { MARKAZ_LIST } from "../../constants";

export default () => {
  const NiyaazFilters = [
    <TextInput label="Search By HOF ITS" source="search" alwaysOn key={0} sx={{ minWidth: 300 }} />,
    <SelectInput
      label="Markaz"
      source="markaz"
      key={1}
      choices={MARKAZ_LIST.map((m) => ({
        id: m.value,
        name: m.displayVal,
      }))}
      sx={{ marginBottom: 0 }}
      alwaysOn
    />,
  ];

  const ListActions = () => (
    <TopToolbar sx={{ justifyContent: "start" }}>
      <FilterButton />
      <SelectColumnsButton />
      <CreateButton />
      <ExportButton />
    </TopToolbar>
  );

  const { currentEvent } = useContext(EventContext);

  const exporter = (niyaaz) => {
    const niyaazForExport = niyaaz.map((niy) => {
      const {
        formNo,
        HOFId,
        HOFName,
        takhmeenAmount,
        chairs,
        zabihat,
        iftaari,
        paidAmount,
        markaz,
        comments,
        admin,
        submitter,
        createdAt,
      } = niy;
      return {
        formNo,
        HOFId,
        HOFName,
        takhmeenAmount,
        chairs,
        zabihat,
        iftaari,
        totalPayable: calcTotalPayable(currentEvent, niy),
        paidAmount,
        markaz,
        comments,
        submitter: admin?.name || submitter,
        createdAt: dayjs(createdAt).format("DD/MM/YYYY"),
      };
    });
    jsonExport(
      niyaazForExport,
      {
        headers: [
          "formNo",
          "HOFId",
          "HOFName",
          "takhmeenAmount",
          "chairs",
          "zabihat",
          "iftaari",
          "paidAmount",
          "markaz",
          "comments",
          "submitter",
          "createdAt",
        ], // order fields in the export
      },
      (err, csv) => {
        downloadCSV(csv, "NiyaazTakhmeen"); // download as 'posts.csv` file
      }
    );
  };

  return (
    <>
      <List
        pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
        filters={NiyaazFilters}
        actions={<ListActions />}
        exporter={exporter}
      >
        <Datagrid rowClick="show" bulkActionButtons={false}>
          <EditButton />
          <TextField source="formNo" />
          <TextField source="markaz" />
          <TextField source="HOFId" label="HOF ID" />
          <TextField source="HOFName" label="HOF Name" />
          <TextField source="HOFPhone" label="HOF Phone" />
          <NumberField source="takhmeenAmount" />
          <NumberField source="paidAmount" />
          <FunctionField
            label="Submitter"
            source="submitter"
            render={(record) => <span>{record?.admin?.name || record.submitter}</span>}
          />
          <FunctionField
            label="Download"
            source="formNo"
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