import { Datagrid, TextField, FunctionField, useListContext, type RaRecord } from "react-admin";
import { Typography } from "@mui/material";
import { formatDisplayDateTime } from "@/utils/date-format";
import { RecipientStatusChip } from "./StatusChips";

const RecipientsListContent = () => {
  const { isLoading, error } = useListContext();

  if (isLoading) return <Typography>Loading recipients...</Typography>;
  if (error) {
    return (
      <Typography color="error">Failed to load recipients: {(error as Error).message}</Typography>
    );
  }

  return (
    <Datagrid bulkActionButtons={false}>
      <TextField source="recipientName" label="Name" />
      <TextField source="recipientPhone" label="Phone" />
      <FunctionField
        label="Status"
        render={(recipient: RaRecord) => (
          <RecipientStatusChip status={recipient.status as string} />
        )}
      />
      <FunctionField
        label="Sent"
        sortBy="sentAt"
        render={(recipient: RaRecord) => formatDisplayDateTime(recipient?.sentAt, { empty: "—" })}
      />
      <FunctionField
        label="Delivered"
        sortBy="deliveredAt"
        render={(recipient: RaRecord) =>
          formatDisplayDateTime(recipient?.deliveredAt, { empty: "—" })
        }
      />
      <FunctionField
        label="Read"
        sortBy="readAt"
        render={(recipient: RaRecord) => formatDisplayDateTime(recipient?.readAt, { empty: "—" })}
      />
      <TextField source="errorMessage" label="Error" />
    </Datagrid>
  );
};

export default RecipientsListContent;
