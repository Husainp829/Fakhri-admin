/* eslint-disable no-console */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useEffect, useState } from "react";
import {
  DatagridConfigurable,
  List,
  useListContext,
  TextInput,
  TextField,
  useUnselectAll,
  TopToolbar,
  FilterButton,
  CreateButton,
  ExportButton,
  SelectColumnsButton,
  Pagination,
  FunctionField,
  DateField,
  SelectInput,
} from "react-admin";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const getTabIdFromFilters = (filters, statuses) => {
  const t = statuses.findIndex((s) => s.id === filters?.sabilType);
  if (t !== -1) {
    return t;
  }
  return 1;
};

function TabbedDatagrid() {
  const listContext = useListContext();
  const { filterValues, setFilters, resource } = listContext;
  const initValues = JSON.parse(localStorage.getItem(`${resource}_count`)) || [];
  const sabilTypeList = initValues.map((i) => ({
    id: i.sabilType,
    name: `${i.sabilType} (${i.count})`,
  }));

  const [tabValue, setTabValue] = useState(getTabIdFromFilters(filterValues, sabilTypeList));
  const handleChange = (event, value) => {
    const newFilterValues = getFilterValues(value);
    setFilters({ ...filterValues, ...newFilterValues });
  };

  const getFilterValues = (tabId) => {
    const valueObj = sabilTypeList?.[tabId] || { id: "CHULA", name: "Chula" };
    return {
      sabilType: valueObj.id,
    };
  };

  useEffect(() => {
    const t = getTabIdFromFilters(filterValues, sabilTypeList);
    setTabValue(t);
  }, [filterValues, sabilTypeList]);

  const fields = [
    <TextField source="sabilNo" label="Sabil No." key="sabilNo" />,
    <TextField source="sabilType" label="Type" key="sabilType" />,
    <TextField source="itsNo" label="ITS" key="itsNo" />,
    <FunctionField
      label="Name"
      render={(record) => record.itsdata?.Full_Name || record.name}
      key="name"
    />,
    <TextField
      source="sabilTakhmeenCurrent.takhmeenAmount"
      label="Takhmeen"
      key="takhmeenAmount"
    />,
    <TextField source="mohallah" label="Mohallah" key="itsdata" />,
    <DateField source="lastPaidDate" key="lastPaidDate" label="Last Paid Date" />,
  ];

  const PostBulkActionButtons = () => <div style={{ marginLeft: "25px" }}></div>;

  const DataGrid = () => (
    <DatagridConfigurable
      size="small"
      sx={{
        color: "success.main",
      }}
      bulkActionButtons={<PostBulkActionButtons />}
      rowClick="show"
    >
      {[...fields]}
    </DatagridConfigurable>
  );

  return (
    <>
      <Tabs value={tabValue} indicatorColor="primary" onChange={handleChange}>
        {sabilTypeList?.map((choice, i) => (
          <Tab key={i} label={choice.name} value={i} />
        ))}
      </Tabs>
      <Divider />
      <div>
        <DataGrid />
      </div>
    </>
  );
}

const RegistrationFilters = [
  <TextInput
    label="Search By HOF ITS OR Sabil No..."
    source="search"
    alwaysOn
    key={0}
    sx={{ minWidth: 300 }}
  />,
  <SelectInput
    label="Status"
    source="status"
    key={1}
    choices={[
      { id: "ACTIVE", name: "Active" },
      { id: "CLOSED", name: "Closed" },
    ]}
    sx={{ marginBottom: 0 }}
  />,
];

export default function OrderList(props) {
  const { resource } = props;
  const unselectAll = useUnselectAll(resource);

  useEffect(() => {
    unselectAll();
  }, [resource]);

  const ListActions = () => (
    <TopToolbar sx={{ justifyContent: "start" }}>
      <FilterButton />
      <SelectColumnsButton />
      <CreateButton />
      <ExportButton />
    </TopToolbar>
  );
  return (
    <>
      <List
        {...props}
        sort={{ field: "updatedAt", order: "DESC" }}
        filterDefaultValues={{ sabilType: "CHULA" }}
        perPage={25}
        pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
        filters={RegistrationFilters}
        actions={<ListActions />}
        sx={{
          "& .RaList-main form": {
            flex: "none",
          },
          "& .RaList-main .MuiToolbar-root": {
            justifyContent: "start",
          },
          "& .RaList-main .MuiTablePagination-spacer": {
            display: "none",
          },
        }}
      >
        <TabbedDatagrid {...props} />
      </List>
    </>
  );
}
