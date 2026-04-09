import { Card, CardContent, Typography, Box, LinearProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import { formatINR } from "@/utils";

type FmbCollectionProgressProps = {
  stats: {
    paymentsReceived?: number;
    paymentsPending?: number;
    vendorPaymentVoucherTotal?: number;
  };
  collectionPercentage: number;
};

const getProgressBarColor = (percentage: number): string => {
  if (percentage >= 80) return "success.main";
  if (percentage >= 50) return "warning.main";
  return "error.main";
};

export default function FmbCollectionProgress({
  stats,
  collectionPercentage,
}: FmbCollectionProgressProps) {
  const receipts = stats.paymentsReceived || 0;
  const vendorOut = stats.vendorPaymentVoucherTotal || 0;
  const netAfterVendor = receipts - vendorOut;

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Receipts vs period commitments
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Share of annual + contribution commitments collected (by receipts)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {collectionPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(collectionPercentage, 100)}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
                backgroundColor: getProgressBarColor(collectionPercentage),
              },
            }}
          />
        </Box>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="caption" color="text.secondary">
              Income — receipts (period)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "success.main" }}>
              {formatINR(receipts)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="caption" color="text.secondary">
              Pending (period)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "error.main" }}>
              {formatINR(stats.paymentsPending || 0)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="caption" color="text.secondary">
              Vendor expenses (period)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "secondary.main" }}>
              {formatINR(vendorOut)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="caption" color="text.secondary">
              Net after vendor payouts
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: netAfterVendor >= 0 ? "success.main" : "error.main",
              }}
            >
              {formatINR(netAfterVendor)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
