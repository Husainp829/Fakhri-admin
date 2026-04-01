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
import { formatINR } from "../../../utils";

const RegistrationFilters = [
  <TextInput
    label="Search by Name, ITS, FMB, File, or Thaali No..."
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
          <TextField source="fileNo" label="File No." key="fileNo" />
          <TextField
            source="deliveryScheduleProfile.name"
            label="Schedule"
            emptyText="—"
            key="schedule"
          />
          <TextField source="itsNo" label="ITS" key="itsNo" />
          <FunctionField
            label="Name"
            render={(record) => record.itsdata?.Full_Name || record.name}
            key="name"
          />
          <FunctionField
            label="Thalis"
            key="thalis"
            render={(record) => {
              const thalis = Array.isArray(record.thalis) ? record.thalis : [];
              if (!thalis.length) return "—";
              const activeCount = thalis.filter((thali) => thali?.isActive).length;
              return `${activeCount}/${thalis.length} active`;
            }}
          />
          <FunctionField
            label="Pending Balance"
            key="pendingBalance"
            textAlign="right"
            sortBy="pendingBalance"
            render={(record) =>
              formatINR(record?.fmbTakhmeenCurrent?.pendingBalance, { empty: "—" })
            }
          />
          <FunctionField
            label="Paid Balance"
            key="paidBalance"
            textAlign="right"
            sortBy="paidBalance"
            render={(record) => formatINR(record?.fmbTakhmeenCurrent?.paidBalance, { empty: "—" })}
          />
          <FunctionField
            label="Takhmeen"
            key="takhmeenAmount"
            textAlign="right"
            sortBy="takhmeenAmount"
            render={(record) =>
              formatINR(record?.fmbTakhmeenCurrent?.takhmeenAmount, { empty: "—" })
            }
          />
          <FunctionField
            label="Delivery Address"
            key="delivery-address"
            render={(record) => {
              const thalis = Array.isArray(record.thalis) ? record.thalis : [];
              if (!thalis.length) return "—";
              const thali = thalis.find((t) => t?.isActive) || thalis[0];
              const addrParts = [thali?.deliveryAddress, thali?.deliveryMohallah].filter(Boolean);
              return addrParts.length ? addrParts.join(" — ") : "—";
            }}
          />
          <TextField source="remarks" label="Remarks" key="remarks" />
          <DateField source="lastPaidDate" key="lastPaidDate" label="Last Paid Date" />
        </DatagridConfigurable>
      </List>
    </>
  );
}
