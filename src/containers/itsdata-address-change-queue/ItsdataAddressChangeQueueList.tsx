import type { RaRecord } from "react-admin";
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  BooleanInput,
  Button,
  useUpdate,
  useNotify,
  useRefresh,
} from "react-admin";
import Box from "@mui/material/Box";
import { formatDisplayDateTime } from "@/utils/date-format";

const MultilineCell = ({ value }: { value?: string | null }) => (
  <Box sx={{ whiteSpace: "pre-wrap", maxWidth: 380, fontSize: "0.8125rem", lineHeight: 1.45 }}>
    {value || "—"}
  </Box>
);

type QueueRecord = RaRecord & {
  doneAt?: string | null;
  oldAddress?: string;
  newAddress?: string;
};

function MarkDoneCell({ record }: { record: QueueRecord }) {
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
          render={(r: QueueRecord) => <MultilineCell value={r.oldAddress} />}
        />
        <FunctionField
          label="New address (ITS)"
          render={(r: QueueRecord) => <MultilineCell value={r.newAddress} />}
        />
        <TextField source="syncVersion" label="Sync" />
        <FunctionField
          label="Detected"
          sortBy="createdAt"
          render={(r: QueueRecord) => formatDisplayDateTime(r?.createdAt, { empty: "—" })}
        />
        <FunctionField
          label="Handled at"
          sortBy="doneAt"
          render={(r: QueueRecord) => formatDisplayDateTime(r?.doneAt, { empty: "—" })}
        />
        <FunctionField label="" render={(r: QueueRecord) => <MarkDoneCell record={r} />} />
      </Datagrid>
    </List>
  );
}
