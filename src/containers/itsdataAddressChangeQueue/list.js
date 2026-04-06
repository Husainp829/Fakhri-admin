import React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  BooleanInput,
  Button,
  useUpdate,
  useNotify,
  useRefresh,
} from "react-admin";
import Box from "@mui/material/Box";

const MultilineCell = ({ value }) => (
  <Box sx={{ whiteSpace: "pre-wrap", maxWidth: 380, fontSize: "0.8125rem", lineHeight: 1.45 }}>
    {value || "—"}
  </Box>
);

function MarkDoneCell({ record }) {
  const [update, { isPending }] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record?.id) {
    return null;
  }
  if (record.doneAt) {
    return (
      <Box component="span" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
        Handled
      </Box>
    );
  }

  return (
    <Button
      label="Done"
      size="small"
      disabled={isPending}
      onClick={() =>
        update(
          "itsdataAddressChangeQueue",
          {
            id: record.id,
            data: { markDone: true },
            previousData: record,
          },
          {
            onSuccess: () => {
              notify("Marked as handled", { type: "success" });
              refresh();
            },
            onError: (e) => notify(e?.message || "Could not update", { type: "error" }),
          }
        )
      }
    />
  );
}

const QueueFilters = [
  <BooleanInput key="pendingOnly" source="pendingOnly" label="Pending only" alwaysOn />,
];

export default function ItsdataAddressChangeQueueList() {
  return (
    <List
      resource="itsdataAddressChangeQueue"
      sort={{ field: "createdAt", order: "DESC" }}
      filterDefaultValues={{ pendingOnly: true }}
      filters={QueueFilters}
      perPage={25}
    >
      <Datagrid bulkActionButtons={false} rowClick={false}>
        <TextField source="ITS_ID" label="ITS" />
        <TextField source="fullName" label="Name" />
        <FunctionField
          label="Previous address"
          render={(r) => <MultilineCell value={r.oldAddress} />}
        />
        <FunctionField
          label="New address (ITS)"
          render={(r) => <MultilineCell value={r.newAddress} />}
        />
        <TextField source="syncVersion" label="Sync" />
        <DateField source="createdAt" label="Detected" showTime />
        <DateField source="doneAt" label="Handled at" showTime emptyText="—" />
        <FunctionField label="" render={(r) => <MarkDoneCell record={r} />} />
      </Datagrid>
    </List>
  );
}
