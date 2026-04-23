import {
  Show,
  TabbedShowLayout,
  FunctionField,
  useShowController,
  Datagrid,
  ReferenceManyField,
  TextField,
  NumberField,
  Button,
  TopToolbar,
  EditButton,
  useRedirect,
} from "react-admin";
import type { RaRecord, ShowProps } from "react-admin";
import { Box, Typography, Card, CardContent, Chip, LinearProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import { formatListDate } from "@/utils/date-format";

const fmt = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const NiyaazInfoTab = () => (
  <FunctionField
    render={(record: RaRecord) => {
      const takhmeen = Number(record.takhmeen ?? 0);
      const zabihatTotal = Number(record.zabihatTotal ?? 0);
      const totalPayable = takhmeen + zabihatTotal;
      const paid = Number(record.paid ?? 0);
      const balance = Number(record.balance ?? 0);
      const paidPercent = totalPayable > 0 ? Math.min((paid / totalPayable) * 100, 100) : 0;
      const isFullyPaid = balance <= 0;

      return (
        <Box>
          {/* Identity */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" gutterBottom>
                Mumineen Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Form No
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {record.formNo}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    ITS No
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {record.itsNo}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {record.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Hijri Year
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {record.hijriYear}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Financial summary */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="overline" color="text.secondary">
                  Financial Summary
                </Typography>
                <Chip
                  size="small"
                  label={isFullyPaid ? "Fully Paid" : "Pending"}
                  color={isFullyPaid ? "success" : "warning"}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Takhmeen
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {fmt(takhmeen)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Zabihat ({record.zabihatCount ?? 0})
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {fmt(zabihatTotal)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total Payable
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {fmt(totalPayable)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Paid
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {fmt(paid)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Balance
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={balance > 0 ? "error.main" : "success.main"}
                  >
                    {fmt(balance)}
                  </Typography>
                </Grid>
              </Grid>

              {/* Progress bar */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Collection Progress
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {paidPercent.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={paidPercent}
                  sx={{ height: 8, borderRadius: 4 }}
                  color={paidPercent >= 100 ? "success" : "primary"}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }}
  />
);

const ReceiptsTab = () => {
  const { record } = useShowController();
  const redirect = useRedirect();

  if (!record) return null;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button
          label="Add Receipt"
          onClick={() => redirect(`/yearlyNiyaazReceipts/create?yearlyNiyaazId=${record.id}`)}
        >
          <AddIcon />
        </Button>
      </Box>
      <ReferenceManyField
        reference="yearlyNiyaazReceipts"
        target="yearlyNiyaazId"
        record={record}
        sort={{ field: "receiptDate", order: "DESC" }}
        perPage={25}
      >
        <Datagrid rowClick={false} bulkActionButtons={false}>
          <TextField source="receiptNo" label="Receipt No" />
          <FunctionField
            label="Date"
            sortBy="receiptDate"
            render={(rec: RaRecord) => formatListDate(rec?.receiptDate, { empty: "—" })}
          />
          <NumberField source="amount" label="Amount" />
          <TextField source="paymentMode" label="Mode" />
          <TextField source="paymentRef" label="Ref" />
          <TextField source="remarks" label="Remarks" />
          <FunctionField
            label="By"
            render={(rec: RaRecord) =>
              (rec?.admin as { name?: string } | undefined)?.name || rec.createdBy || "-"
            }
          />
          <FunctionField
            label=""
            render={(rec: RaRecord) => (
              <Button
                onClick={() => {
                  window.open(`#/yn-rcpt/${rec.id}`, "_blank");
                }}
              >
                <DownloadIcon />
              </Button>
            )}
          />
        </Datagrid>
      </ReferenceManyField>
    </Box>
  );
};

const ShowActions = () => (
  <TopToolbar>
    <EditButton />
  </TopToolbar>
);

export const YearlyNiyaazShow = (props: ShowProps) => {
  const { record } = useShowController(props);
  if (!record) return null;

  return (
    <Show {...props} actions={<ShowActions />}>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Information">
          <NiyaazInfoTab />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Receipts" path="receipts">
          <ReceiptsTab />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export default YearlyNiyaazShow;
