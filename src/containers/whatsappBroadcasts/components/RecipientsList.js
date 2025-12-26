import React, { useMemo, memo } from "react";
import { List, useRecordContext, Pagination } from "react-admin";
import { Typography } from "@mui/material";
import RecipientsListContent from "./RecipientsListContent";

const RecipientsList = memo(() => {
  const record = useRecordContext();

  const listProps = useMemo(
    () => ({
      resource: "whatsappBroadcastRecipients",
      filter: { broadcastId: record?.id },
      perPage: 25,
      sort: { field: "sentAt", order: "DESC" },
      pagination: <Pagination />,
      actions: false,
      title: false,
    }),
    [record?.id]
  );

  if (!record?.id) {
    return <Typography>No broadcast selected</Typography>;
  }

  return (
    <List {...listProps}>
      <RecipientsListContent />
    </List>
  );
});
RecipientsList.displayName = "RecipientsList";

export default RecipientsList;
