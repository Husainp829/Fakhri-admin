import React, { useMemo } from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  useRecordContext,
  FunctionField,
  TabbedShowLayout,
  Tab,
  DateField,
  ReferenceField,
} from "react-admin";
import { Typography, Divider } from "@mui/material";
import { RecipientsList, StatusChip } from "./components";

const BroadcastShow = () => {
  const record = useRecordContext();

  const errorSection = useMemo(() => {
    if (!record?.errorMessage) return null;
    return (
      <>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom color="error">
          Error
        </Typography>
        <TextField source="errorMessage" label="Error Message" />
      </>
    );
  }, [record?.errorMessage]);

  return (
    <Show>
      <TabbedShowLayout>
        <Tab label="Details">
          <SimpleShowLayout>
            <TextField source="name" label="Broadcast Name" />
            <ReferenceField
              source="templateName"
              reference="whatsappTemplates"
              label="Template"
              link="show"
            >
              <TextField source="name" />
            </ReferenceField>
            <FunctionField
              label="Status"
              render={(r) => <StatusChip status={r.status} />}
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
              render={(r) => (
                <pre style={{ fontSize: "0.875rem" }}>
                  {JSON.stringify(r.filterCriteria || {}, null, 2)}
                </pre>
              )}
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Parameters
            </Typography>
            <FunctionField
              label="Template Parameters"
              render={(r) => (
                <pre style={{ fontSize: "0.875rem" }}>
                  {JSON.stringify(r.parameters || {}, null, 2)}
                </pre>
              )}
            />
            {errorSection}
          </SimpleShowLayout>
        </Tab>
        <Tab label="Recipients" path="recipients">
          <RecipientsList />
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export default BroadcastShow;
