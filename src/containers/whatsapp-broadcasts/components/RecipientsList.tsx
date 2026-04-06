import { useMemo, memo } from "react";
import { List, useRecordContext, Pagination } from "react-admin";
import { Typography } from "@mui/material";
import RecipientsListContent from "./RecipientsListContent";

const RecipientsList = memo(() => {
  const record = useRecordContext();
  const broadcastId = record?.id;

  const listProps = useMemo(
    () => ({
      resource: "whatsappBroadcastRecipients" as const,
      filter: { broadcastId: broadcastId as string | number },
      perPage: 25,
      sort: { field: "sentAt", order: "DESC" as const },
      pagination: <Pagination />,
      actions: false as const,
      title: "" as const,
    }),
    [broadcastId]
  );

  if (!broadcastId) {
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
