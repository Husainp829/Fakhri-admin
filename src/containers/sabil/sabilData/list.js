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
  SimpleList,
} from "react-admin";
import { useMediaQuery } from "@mui/material";
import dayjs from "dayjs";
import CommonTabs from "../../../components/CommonTabs";

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

  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });

  const DataGrid = () =>
    isSmall ? (
      <SimpleList
        primaryText={(record) =>
          `${record.sabilNo ?? "—"} · ${(record.itsdata?.Full_Name || record.name) ?? "—"}`
        }
        secondaryText={(record) => (
          <>
            {record.itsNo ?? "—"} · {record.sabilType ?? "—"}
            <br />
            {record.mohallah ?? "—"} · Takhmeen:{" "}
            {record.sabilTakhmeenCurrent?.takhmeenAmount ?? "—"}
          </>
        )}
        tertiaryText={(record) =>
          record.lastPaidDate ? dayjs(record.lastPaidDate).format("DD-MMM-YYYY") : "—"
        }
        linkType="show"
        rowSx={() => ({ borderBottom: "1px solid #e0e0e0" })}
      />
    ) : (
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

  const tabOptions =
    sabilTypeList?.map((choice, i) => ({
      id: i,
      name: choice.name,
      shortLabel: choice.id,
    })) ?? [];

  return (
    <>
      <CommonTabs options={tabOptions} value={tabValue} onChange={handleChange} showDivider />
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

  // Parse filter from URL query parameters
  const getFilterFromURL = () => {
    if (typeof window === "undefined") return { sabilType: "CHULA" };

    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get("filter");

    if (filterParam) {
      try {
        const parsed = JSON.parse(filterParam);
        return { ...parsed, sabilType: parsed.sabilType || "CHULA" };
      } catch (e) {
        console.error("Error parsing filter from URL:", e);
      }
    }

    return { sabilType: "CHULA" };
  };

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
        filterDefaultValues={getFilterFromURL()}
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
