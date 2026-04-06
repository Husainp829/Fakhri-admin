import type { ReactNode } from "react";
import type { RaRecord } from "react-admin";
import {
  useShowContext,
  ReferenceManyField,
  useListContext,
  ReferenceField,
  TextField,
} from "react-admin";
import {
  Paper,
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import BalanceSummary from "./BalanceSummary";

const InfoSection = ({ title, children }: { title: string; children: ReactNode }) => (
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

const getByPath = (record: RaRecord | undefined, source: string): unknown => {
  if (!record) return undefined;
  return source.split(".").reduce<unknown>((obj, key) => {
    if (obj && typeof obj === "object" && key in obj) {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }, record);
};

const InfoField = ({
  source,
  label,
  record,
}: {
  source: string;
  label?: string;
  record?: RaRecord;
}) => {
  const value = getByPath(record, source);

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
        {value != null && value !== "" ? String(value) : "-"}
      </Typography>
    </Box>
  );
};

const DateInfoField = ({
  source,
  label,
  emptyText = "-",
  record,
}: {
  source: string;
  label?: string;
  emptyText?: string;
  record?: RaRecord;
}) => {
  const dateValue = getByPath(record, source);

  const formatUTCDate = (date: unknown) => {
    if (!date) return emptyText;
    const d = new Date(date as string);
    const year = d.getUTCFullYear();
    const month = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    const day = d.getUTCDate();
    return `${month} ${day}, ${year}`;
  };

  const isEstablishment = record?.sabilType === "ESTABLISHMENT";
  const isLastPaidDate = source === "lastPaidDate";

  let displayValue = formatUTCDate(dateValue);
  if (isEstablishment && isLastPaidDate && dateValue) {
    const d = new Date(dateValue as string);
    const month = d.getUTCMonth() + 1;
    const year = d.getUTCFullYear();

    if (month === 4) {
      displayValue = `April ${year} to March ${year + 1}`;
    }
  }

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
        {displayValue}
      </Typography>
    </Box>
  );
};

type TakhmeenRow = RaRecord & {
  takhmeenAmount?: number;
  startDate?: string;
  updatedBy?: string;
};

const TakhmeenHistoryTable = () => {
  const { data, isLoading } = useListContext<TakhmeenRow>();

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

const BasicInfo = () => {
  const { record } = useShowContext<RaRecord>();

  return (
    <Box sx={{ p: 1 }}>
      <BalanceSummary />
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
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

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
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

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
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
                {record?.sabilTakhmeenCurrent?.takhmeenAmount != null
                  ? Number(record.sabilTakhmeenCurrent.takhmeenAmount).toLocaleString("en-IN")
                  : "-"}
              </Typography>
            </Box>
          </InfoSection>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={12}>
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

export default BasicInfo;
