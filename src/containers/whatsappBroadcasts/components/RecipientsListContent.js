import React from "react";
import {
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  useListContext,
} from "react-admin";
import { Typography } from "@mui/material";
import { RecipientStatusChip } from "./StatusChips";

const RecipientsListContent = () => {
  const { isLoading, error } = useListContext();

  if (isLoading) return <Typography>Loading recipients...</Typography>;
  if (error) {
    return (
      <Typography color="error">
        Failed to load recipients: {error.message}
      </Typography>
    );
  }

  return (
    <Datagrid bulkActionButtons={false}>
      <TextField source="recipientName" label="Name" />
      <TextField source="recipientPhone" label="Phone" />
      <FunctionField
        label="Status"
        render={(recipient) => (
          <RecipientStatusChip status={recipient.status} />
        )}
      />
      <DateField source="sentAt" label="Sent" showTime />
      <DateField source="deliveredAt" label="Delivered" showTime />
      <DateField source="readAt" label="Read" showTime />
      <TextField source="errorMessage" label="Error" ellipsis />
    </Datagrid>
  );
};

export default RecipientsListContent;
