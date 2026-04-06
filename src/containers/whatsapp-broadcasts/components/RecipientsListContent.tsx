import {
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  useListContext,
  type RaRecord,
} from "react-admin";
import { Typography } from "@mui/material";
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
      <DateField source="sentAt" label="Sent" showTime />
      <DateField source="deliveredAt" label="Delivered" showTime />
      <DateField source="readAt" label="Read" showTime />
      <TextField source="errorMessage" label="Error" />
    </Datagrid>
  );
};

export default RecipientsListContent;
