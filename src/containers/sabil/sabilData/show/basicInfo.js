import React from "react";
import { useShowContext, ReferenceManyField, useListContext, ReferenceField, TextField } from "react-admin";
import { Grid, Paper, Typography, Box, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import BalanceSummary from "./BalanceSummary";

const InfoSection = ({ title, children }) => (
  <Paper
    elevation={1}
    sx={{
      p: 2,
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Typography
      variant="h6"
      sx={{
        mb: 1.5,
        pb: 0.75,
        borderBottom: "2px solid",
        borderColor: "primary.main",
        fontWeight: 600,
        color: "text.primary",
        fontSize: "1.1rem",
      }}
    >
      {title}
    </Typography>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>{children}</Box>
  </Paper>
);

const InfoField = ({ source, label, record }) => {
  const value = source.split(".").reduce((obj, key) => obj?.[key], record);

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
      >
        {label || source}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25 }}>
        {value || "-"}
      </Typography>
    </Box>
  );
};

const DateInfoField = ({ source, label, emptyText = "-", record }) => {
  const dateValue = source.split(".").reduce((obj, key) => obj?.[key], record);

  const formatUTCDate = (date) => {
    if (!date) return emptyText;
    const d = new Date(date);
    // Format as UTC without timezone conversion
    const year = d.getUTCFullYear();
    const month = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    const day = d.getUTCDate();
    return `${month} ${day}, ${year}`;
  };

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
      >
        {label || source}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25 }}>
        {formatUTCDate(dateValue)}
      </Typography>
    </Box>
  );
};

const TakhmeenHistoryTable = () => {
  const { data, isLoading } = useListContext();

  if (isLoading) {
    return (
      <Typography variant="body2" sx={{ py: 2, color: "text.secondary" }}>
        Loading...
      </Typography>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Typography variant="body2" sx={{ py: 2, color: "text.secondary", textAlign: "center" }}>
        No takhmeen history available
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Updated By</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((takhmeen) => (
            <TableRow key={takhmeen.id}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ₹{(takhmeen.takhmeenAmount || 0).toLocaleString("en-IN")}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {takhmeen.startDate
                    ? new Date(takhmeen.startDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "-"}
                </Typography>
              </TableCell>
              <TableCell>
                {takhmeen.updatedBy ? (
                  <ReferenceField
                    record={takhmeen}
                    source="updatedBy"
                    reference="admins"
                    link={false}
                  >
                    <TextField source="name" />
                  </ReferenceField>
                ) : (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    -
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default () => {
  const { record } = useShowContext();

  return (
    <Box sx={{ p: 1 }}>
      {/* Balance Summary Section */}
      <BalanceSummary />

      <Grid container spacing={2}>
        {/* Sabil Information */}
        <Grid item xs={12} md={4}>
          <InfoSection title="Sabil Information">
            <InfoField source="sabilNo" label="Sabil Number" record={record} />
            <Divider sx={{ my: 0.75 }} />
            <InfoField source="sabilType" label="Sabil Type" record={record} />
            <Divider sx={{ my: 0.75 }} />
            <DateInfoField source="lastPaidDate" label="Last Paid Date" record={record} />
            <Divider sx={{ my: 0.75 }} />
            <DateInfoField
              source="sabilTakhmeenCurrent.createdAt"
              label="Takhmeen Start Date"
              record={record}
            />
          </InfoSection>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={4}>
          <InfoSection title="Personal Information">
            <InfoField source="itsdata.Full_Name" label="Name" record={record} />
            <Divider sx={{ my: 0.75 }} />
            <InfoField source="itsdata.ITS_ID" label="ITS Number" record={record} />
            <Divider sx={{ my: 0.75 }} />
            <InfoField source="itsdata.Jamaat" label="Mohalla" record={record} />
            <Divider sx={{ my: 0.75 }} />
            <InfoField source="address" label="Address" record={record} />
          </InfoSection>
        </Grid>

        {/* Takhmeen Information */}
        <Grid item xs={12} md={4}>
          <InfoSection title="Takhmeen Information">
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              >
                Current Takhmeen Amount
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mt: 0.5,
                  fontWeight: 700,
                  color: "primary.main",
                }}
              >
                ₹
                {record?.sabilTakhmeenCurrent?.takhmeenAmount
                  ? record.sabilTakhmeenCurrent.takhmeenAmount.toLocaleString("en-IN")
                  : "-"}
              </Typography>
            </Box>
          </InfoSection>
        </Grid>
      </Grid>

      {/* Takhmeen History */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 1.5,
                pb: 0.75,
                borderBottom: "2px solid",
                borderColor: "primary.main",
                fontWeight: 600,
                color: "text.primary",
                fontSize: "1.1rem",
              }}
            >
              Takhmeen History
            </Typography>
            <ReferenceManyField
              reference="sabilTakhmeen"
              target="sabilId"
              label={false}
              sort={{ field: "startDate", order: "DESC" }}
              filter={{ sabilId: record?.id }}
            >
              <TakhmeenHistoryTable />
            </ReferenceManyField>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
