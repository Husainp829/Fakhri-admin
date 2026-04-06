import React, { useMemo } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import {
  Datagrid,
  DateField,
  Pagination,
  ReferenceManyField,
  TextField,
  useGetList,
  useRecordContext,
} from "react-admin";
import { Link } from "react-router-dom";

const AddSuspensionButton = ({ thali, fmbId }) => {
  if (!thali?.id) {
    return null;
  }
  return (
    <Button
      component={Link}
      to={`/fmbThaliSuspension/create?fmbId=${encodeURIComponent(fmbId)}&fmbThaliId=${encodeURIComponent(thali.id)}`}
      variant="outlined"
      color={thali.isActive ? "primary" : "inherit"}
      size="small"
      disabled={!thali.isActive}
    >
      {thali.isActive ? "Add suspension" : "Inactive"}
    </Button>
  );
};

const isActiveOnDate = (suspension, date) => {
  if (!suspension?.startDate || !suspension?.endDate) return false;
  const start = new Date(suspension.startDate);
  const end = new Date(suspension.endDate);
  const d = new Date(date);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d >= start && d <= end;
};

const ThaliTodaySuspensionStatus = ({ thaliId }) => {
  const today = useMemo(() => new Date(), []);
  const todayLabel = useMemo(
    () => today.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
    [today]
  );
  const {
    data = [],
    isLoading,
    error,
  } = useGetList("fmbThaliSuspension", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "startDate", order: "DESC" },
    filter: { fmbThaliId: thaliId },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <CircularProgress size={14} />
        <Typography variant="body2" color="text.secondary">
          Checking today&apos;s suspension status…
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 1 }}>
        Could not determine suspension status for {todayLabel}.
      </Alert>
    );
  }

  const activeSuspension = data.find((row) => isActiveOnDate(row, today));
  if (!activeSuspension) {
    return (
      <Alert severity="success" sx={{ mb: 1 }}>
        Active today ({todayLabel}): No suspension. Delivery is expected.
      </Alert>
    );
  }

  return (
    <Alert severity="info" sx={{ mb: 1 }}>
      Suspended today ({todayLabel}). The responsible suspension row is highlighted below (
      {new Date(activeSuspension.startDate).toLocaleDateString("en-IN")} -{" "}
      {new Date(activeSuspension.endDate).toLocaleDateString("en-IN")}).
    </Alert>
  );
};

export default function SuspensionsTab() {
  const record = useRecordContext();
  const thalis = Array.isArray(record?.thalis) ? record.thalis : [];

  if (!thalis.length) {
    return (
      <Box sx={{ p: 1 }}>
        <Typography color="text.secondary">No thalis found for this FMB.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {thalis.map((thali) => (
        <Paper key={thali.id} sx={{ p: 1.5, mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}
          >
            <Typography variant="subtitle2">
              {thali.thaliNo}
              {thali?.thaliType?.name ? ` — ${thali.thaliType.name}` : ""}
            </Typography>
            <AddSuspensionButton thali={thali} fmbId={record.id} />
          </Box>
          <ThaliTodaySuspensionStatus thaliId={thali.id} />
          <ReferenceManyField
            reference="fmbThaliSuspension"
            target="fmbThaliId"
            label={false}
            record={thali}
            sort={{ field: "startDate", order: "DESC" }}
            perPage={5}
            pagination={<Pagination rowsPerPageOptions={[5]} />}
          >
            <Datagrid
              rowClick="edit"
              bulkActionButtons={false}
              size="small"
              rowSx={(row) =>
                isActiveOnDate(row, new Date())
                  ? {
                      backgroundColor: "#fff8e1",
                      "& td": { fontWeight: 600 },
                    }
                  : undefined
              }
            >
              <DateField source="startDate" label="Start (inclusive)" />
              <DateField source="endDate" label="End (inclusive)" />
              <TextField source="remarks" emptyText="—" />
            </Datagrid>
          </ReferenceManyField>
        </Paper>
      ))}
    </Box>
  );
}
