/* eslint-disable no-console */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useEffect } from "react";
import {
  DatagridConfigurable,
  List,
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
} from "react-admin";

const RegistrationFilters = [
  <TextInput
    label="Search By HOF ITS OR Thaali No..."
    source="search"
    alwaysOn
    key={0}
    sx={{ minWidth: 300 }}
  />,
];

export default function OrderList(props) {
  const { resource } = props;
  const unselectAll = useUnselectAll(resource);
  const PostBulkActionButtons = () => <div style={{ marginLeft: "25px" }}></div>;
  useEffect(() => {
    unselectAll();
  }, [resource]);

  const ListActions = () => (
    <TopToolbar sx={{ justifyContent: "start" }}>
      <SelectColumnsButton />
      <FilterButton />
      <CreateButton />
      <ExportButton />
    </TopToolbar>
  );
  return (
    <>
      <List
        {...props}
        sort={{ field: "updatedAt", order: "DESC" }}
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
        <DatagridConfigurable
          size="small"
          sx={{
            color: "success.main",
          }}
          bulkActionButtons={<PostBulkActionButtons />}
          rowClick="show"
        >
          <TextField source="fmbNo" label="Sabil No." key="sabilNo" />
          <TextField source="itsNo" label="ITS" key="itsNo" />
          <FunctionField
            label="Name"
            render={(record) => record.itsdata?.Full_Name || record.name}
            key="name"
          />
          <TextField
            source="fmbTakhmeenCurrent.pendingBalance"
            key="pendingBalance"
            label="Pending Balance"
          />
          <TextField
            source="fmbTakhmeenCurrent.paidBalance"
            key="paidBalance"
            label="Paid Balance"
          />
          <TextField
            source="fmbTakhmeenCurrent.takhmeenAmount"
            label="Takhmeen"
            key="takhmeenAmount"
          />
          <TextField source="mohallah" label="Mohallah" key="itsdata" />
          <TextField source="itsdata.Sector_Incharge_Name" label="Masool" key="itsdata" />
          <DateField source="lastPaidDate" key="lastPaidDate" label="Last Paid Date" />
        </DatagridConfigurable>
      </List>
    </>
  );
}
