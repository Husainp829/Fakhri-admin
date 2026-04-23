import { useMemo } from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  useRecordContext,
  FunctionField,
  TabbedShowLayout,
  Tab,
  ReferenceField,
  type RaRecord,
} from "react-admin";
import { Typography, Divider } from "@mui/material";
import { formatDisplayDateTime } from "@/utils/date-format";
import { RecipientsList, StatusChip } from "./components";

export default function WhatsappBroadcastShow() {
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
              render={(r) => <StatusChip status={r.status as string} />}
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Timing
            </Typography>
            <FunctionField
              label="Created"
              render={(r: RaRecord) => formatDisplayDateTime(r?.createdAt, { empty: "—" })}
            />
            <FunctionField
              label="Started"
              render={(r: RaRecord) => formatDisplayDateTime(r?.startedAt, { empty: "—" })}
            />
            <FunctionField
              label="Completed"
              render={(r: RaRecord) => formatDisplayDateTime(r?.completedAt, { empty: "—" })}
            />
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
}
