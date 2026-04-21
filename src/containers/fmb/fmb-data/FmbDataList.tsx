import { useEffect } from "react";
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
  type ListProps,
  type RaRecord,
} from "react-admin";
import { formatINR } from "@/utils";
// import { FmbDataCsvImportButton } from "./csv-import/FmbDataCsvImportButton";

const RegistrationFilters = [
  <TextInput
    label="Search by Name, ITS, FMB, File, or Thaali No..."
    source="search"
    alwaysOn
    key={0}
    sx={{ minWidth: 300 }}
  />,
  <TextInput
    label="Thali tag"
    source="thaliTag"
    key="thaliTag"
    helperText="Case-insensitive; matches if any thali has this tag"
  />,
];

export default function FmbDataList(props: ListProps) {
  const { resource } = props;
  const unselectAll = useUnselectAll(resource);
  const PostBulkActionButtons = () => <div style={{ marginLeft: "25px" }} />;
  useEffect(() => {
    unselectAll();
  }, [resource, unselectAll]);

  const ListActions = () => (
    <TopToolbar sx={{ justifyContent: "start" }}>
      <SelectColumnsButton />
      <FilterButton />
      <CreateButton />
      {/* <FmbDataCsvImportButton /> */}
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
          <TextField source="itsNo" label="ITS" key="itsNo" />
          <TextField source="name" label="Name" key="name" sortable />
          <FunctionField
            label="Thalis"
            key="thalis"
            render={(record: RaRecord) => {
              const thalis = Array.isArray(record.thalis) ? record.thalis : [];
              if (!thalis.length) return "—";
              const activeCount = thalis.filter(
                (thali: { isActive?: boolean }) => thali?.isActive
              ).length;
              return `${activeCount}/${thalis.length} active`;
            }}
          />
          <TextField
            source="deliveryScheduleProfile.name"
            label="Schedule"
            emptyText="—"
            key="schedule"
          />
          <FunctionField
            label="Tags"
            key="tags"
            render={(record: RaRecord) => {
              const thalis = Array.isArray(record.thalis) ? record.thalis : [];
              const tagSet = new Set<string>();
              for (const thali of thalis) {
                const tags = Array.isArray((thali as { tags?: unknown }).tags)
                  ? (thali as { tags: unknown[] }).tags
                  : [];
                for (const tag of tags) {
                  if (typeof tag === "string" && tag.trim()) {
                    tagSet.add(tag.trim());
                  }
                }
              }
              const list = [...tagSet].sort((a, b) =>
                a.localeCompare(b, undefined, { sensitivity: "base" })
              );
              return list.length ? list.join(", ") : "—";
            }}
          />
          <FunctionField
            label="Pending Balance"
            key="pendingBalance"
            textAlign="right"
            sortBy="pendingBalance"
            render={(record: RaRecord) =>
              formatINR(
                (record.fmbTakhmeenCurrent as { pendingBalance?: unknown } | undefined)
                  ?.pendingBalance,
                { empty: "—" }
              )
            }
          />
          <FunctionField
            label="Paid Balance"
            key="paidBalance"
            textAlign="right"
            sortBy="paidBalance"
            render={(record: RaRecord) =>
              formatINR(
                (record.fmbTakhmeenCurrent as { paidBalance?: unknown } | undefined)?.paidBalance,
                { empty: "—" }
              )
            }
          />
          <FunctionField
            label="Takhmeen"
            key="takhmeenAmount"
            textAlign="right"
            sortBy="takhmeenAmount"
            render={(record: RaRecord) =>
              formatINR(
                (record.fmbTakhmeenCurrent as { takhmeenAmount?: unknown } | undefined)
                  ?.takhmeenAmount,
                { empty: "—" }
              )
            }
          />
          <FunctionField
            label="Delivery Address"
            key="delivery-address"
            render={(record: RaRecord) => {
              const thalis = Array.isArray(record.thalis) ? record.thalis : [];
              if (!thalis.length) return "—";
              const thali = thalis.find((t: { isActive?: boolean }) => t?.isActive) || thalis[0];
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
