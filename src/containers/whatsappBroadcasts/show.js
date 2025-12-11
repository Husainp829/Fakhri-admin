import React, { useState } from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  Button,
  useNotify,
  useRefresh,
  useRecordContext,
  useDataProvider,
  FunctionField,
  TabbedShowLayout,
  Tab,
  Datagrid,
  DateField,
} from "react-admin";
import { Retry as RetryIcon, Cancel as CancelIcon } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  LinearProgress,
} from "@mui/material";

const BroadcastActions = () => {
  const notify = useNotify();
  const refresh = useRefresh();
  const record = useRecordContext();
  const dataProvider = useDataProvider();

  const handleRetryFailed = async () => {
    try {
      await dataProvider.create("whatsappBroadcasts", {
        data: {},
        meta: { action: "retry-failed", id: record.id },
      });
      notify("Retrying failed messages...", { type: "info" });
      refresh();
    } catch (error) {
      notify(error?.body?.message || "Failed to retry messages", {
        type: "error",
      });
    }
  };

  const handleCancel = async () => {
    try {
      await dataProvider.create("whatsappBroadcasts", {
        data: {},
        meta: { action: "cancel", id: record.id },
      });
      notify("Broadcast cancelled", { type: "success" });
      refresh();
    } catch (error) {
      notify(error?.body?.message || "Failed to cancel broadcast", {
        type: "error",
      });
    }
  };

  const canRetry = record?.status === "COMPLETED" && record?.failureCount > 0;
  const canCancel =
    record?.status === "PENDING" || record?.status === "PROCESSING";

  return (
    <TopToolbar>
      {canRetry && (
        <Button
          label="Retry Failed"
          onClick={handleRetryFailed}
          startIcon={<RetryIcon />}
        />
      )}
      {canCancel && (
        <Button
          label="Cancel"
          onClick={handleCancel}
          startIcon={<CancelIcon />}
        />
      )}
    </TopToolbar>
  );
};

const StatusChip = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case "PENDING":
        return "default";
      case "PROCESSING":
        return "warning";
      case "COMPLETED":
        return "success";
      case "FAILED":
        return "error";
      case "CANCELLED":
        return "default";
      default:
        return "default";
    }
  };

  return <Chip label={status} color={getColor()} size="small" />;
};

const RecipientStatusChip = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case "PENDING":
        return "default";
      case "SENT":
        return "info";
      case "DELIVERED":
        return "success";
      case "READ":
        return "success";
      case "FAILED":
        return "error";
      default:
        return "default";
    }
  };

  return <Chip label={status} color={getColor()} size="small" />;
};

const BroadcastStats = ({ record }) => {
  if (!record) return null;

  const progress =
    record.totalRecipients > 0
      ? ((record.successCount + record.failureCount) / record.totalRecipients) *
        100
      : 0;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Broadcast Statistics
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">Progress</Typography>
            <Typography variant="body2">
              {record.successCount + record.failureCount} /{" "}
              {record.totalRecipients}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Recipients
            </Typography>
            <Typography variant="h6">{record.totalRecipients}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Success
            </Typography>
            <Typography variant="h6" color="success.main">
              {record.successCount}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Failed
            </Typography>
            <Typography variant="h6" color="error.main">
              {record.failureCount}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const RecipientsList = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  React.useEffect(() => {
    if (record?.id) {
      // Fetch recipients from the backend endpoint
      fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3012"
        }/v2/whatsapp-broadcasts/${record.id}/recipients?limit=1000`
      )
        .then((res) => res.json())
        .then((json) => {
          if (json.data && Array.isArray(json.data)) {
            setRecipients(json.data);
            setTotal(json.total || json.data.length);
          } else if (json.rows && Array.isArray(json.rows)) {
            setRecipients(json.rows);
            setTotal(json.count || json.rows.length);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch recipients:", error);
          setLoading(false);
        });
    }
  }, [record?.id]);

  if (loading) return <Typography>Loading recipients...</Typography>;

  return (
    <Datagrid data={recipients} total={total} bulkActionButtons={false}>
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

export default () => {
  const record = useRecordContext();

  return (
    <Show actions={<BroadcastActions />}>
      <TabbedShowLayout>
        <Tab label="Details">
          <BroadcastStats record={record} />
          <SimpleShowLayout>
            <TextField source="name" label="Broadcast Name" />
            <TextField source="templateName" label="Template" />
            <FunctionField
              label="Status"
              render={(record) => <StatusChip status={record.status} />}
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Timing
            </Typography>
            <DateField source="createdAt" label="Created" showTime />
            <DateField source="startedAt" label="Started" showTime />
            <DateField source="completedAt" label="Completed" showTime />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Filter Criteria
            </Typography>
            <FunctionField
              label="Filters"
              render={(record) => (
                <pre style={{ fontSize: "0.875rem" }}>
                  {JSON.stringify(record.filterCriteria || {}, null, 2)}
                </pre>
              )}
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Parameters
            </Typography>
            <FunctionField
              label="Template Parameters"
              render={(record) => (
                <pre style={{ fontSize: "0.875rem" }}>
                  {JSON.stringify(record.parameters || {}, null, 2)}
                </pre>
              )}
            />
            {record?.errorMessage && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="error">
                  Error
                </Typography>
                <TextField source="errorMessage" label="Error Message" />
              </>
            )}
          </SimpleShowLayout>
        </Tab>
        <Tab label="Recipients" path="recipients">
          <RecipientsList />
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};
