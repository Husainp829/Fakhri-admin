import {
  useRecordContext,
  ReferenceManyField,
  Datagrid,
  TextField,
  NumberField,
  ReferenceField,
  FunctionField,
  Button,
  EditButton,
  usePermissions,
  type RaRecord,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import { hasPermission } from "@/utils/permission-utils";
import { formatListDate } from "@/utils/date-format";

export const ReceiptsTab = () => {
  const record = useRecordContext();
  const { permissions } = usePermissions();
  if (!record) return null;

  return (
    <ReferenceManyField
      reference="contRcpt"
      target="bookingId"
      record={record}
      sort={{ field: "date", order: "DESC" }}
      perPage={25}
    >
      <Datagrid rowClick={false} bulkActionButtons={false}>
        <TextField source="type" />
        <TextField source="receiptNo" label="Receipt No" />
        <TextField source="organiserIts" label="Organiser ITS" />
        <TextField source="organiser" />
        <FunctionField
          label="Date"
          source="date"
          render={(r: RaRecord) =>
            r?.date ? <span>{formatListDate(r.date as string)}</span> : <span>—</span>
          }
        />
        <NumberField source="amount" />
        <TextField source="mode" />
        <ReferenceField source="createdBy" reference="admins" link={false}>
          <TextField source="name" />
        </ReferenceField>
        <TextField source="ref" />
        <FunctionField
          label="Download"
          source="formNo"
          render={(r: RaRecord) => (
            <Button
              onClick={() => {
                window.open(`#/${r.type === "RENT" ? "cont-rcpt" : "dep-rcpt"}/${r.id}`, "_blank");
              }}
            >
              <DownloadIcon />
            </Button>
          )}
          key="name"
        />
        <FunctionField
          label="Edit date"
          render={(r: RaRecord) =>
            hasPermission(permissions, "bookingReceipts.edit") ? (
              <EditButton resource="contRcpt" record={r} label="Edit date" />
            ) : null
          }
        />
      </Datagrid>
    </ReferenceManyField>
  );
};

export default ReceiptsTab;
