import { useState, useEffect, useImperativeHandle, forwardRef, type ReactNode } from "react";
import type { RaRecord } from "react-admin";
import { useShowContext } from "react-admin";
import { Paper, Typography, Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { callApi } from "@/dataprovider/misc-apis";

type LastPaidMonth = { month: number; year: number };

type BalanceSummaryRow = {
  pendingBalance?: number;
  lastPaidMonth?: LastPaidMonth | null;
  writtenOffAmount?: number;
};

type SummaryItemConfig = {
  key: keyof BalanceSummaryRow;
  label: string;
  color: string;
  format: (value: unknown, record: RaRecord | undefined) => ReactNode;
};

const SUMMARY_ITEMS: SummaryItemConfig[] = [
  {
    key: "pendingBalance",
    label: "Pending Balance",
    color: "error.main",
    format: (value) => `₹${(Number(value) || 0).toLocaleString("en-IN")}`,
  },
  {
    key: "lastPaidMonth",
    label: "Last Paid",
    color: "text.primary",
    format: (value, record) => {
      if (!value || typeof value !== "object") return "N/A";
      const v = value as LastPaidMonth;
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const fullMonthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const isEstablishment = record?.sabilType === "ESTABLISHMENT";

      if (isEstablishment && v.month === 4) {
        return `${fullMonthNames[3]} ${v.year} to ${fullMonthNames[2]} ${v.year + 1}`;
      }

      const monthName = monthNames[v.month - 1] || String(v.month);
      return `${monthName} - ${v.year}`;
    },
  },
  {
    key: "writtenOffAmount",
    label: "Written Off Amount",
    color: "warning.main",
    format: (value) => `₹${(Number(value) || 0).toLocaleString("en-IN")}`,
  },
];

type SummaryItemProps = {
  label: string;
  value: unknown;
  color: string;
  format: (value: unknown) => ReactNode;
};

const SummaryItem = ({ label, value, color, format }: SummaryItemProps) => (
  <Grid
    size={{
      xs: 12,
      sm: 6,
      md: 3,
    }}
  >
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          mt: 0.5,
          fontWeight: 700,
          color,
        }}
      >
        {format(value)}
      </Typography>
    </Box>
  </Grid>
);

export type BalanceSummaryHandle = {
  refresh: () => Promise<void>;
};

const BalanceSummary = forwardRef<BalanceSummaryHandle>((_props, ref) => {
  const { record } = useShowContext<RaRecord>();
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummaryRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalanceSummary = async () => {
    if (!record?.id) return;

    setIsLoading(true);
    try {
      const response = await callApi({
        location: "sabilLedger",
        method: "GET",
        id: `${record.id}/balance-summary`,
      });
      const payload = response?.data as
        | { rows?: BalanceSummaryRow[] }
        | BalanceSummaryRow
        | undefined;
      if (payload && typeof payload === "object" && "rows" in payload && payload.rows?.[0]) {
        setBalanceSummary(payload.rows[0]);
      } else if (payload && typeof payload === "object" && !("rows" in payload)) {
        setBalanceSummary(payload as BalanceSummaryRow);
      }
    } catch (error) {
      console.error("Error fetching balance summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (record?.id) {
      fetchBalanceSummary();
    }
  }, [record?.id]);

  useImperativeHandle(ref, () => ({
    refresh: fetchBalanceSummary,
  }));

  if (isLoading || !balanceSummary) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={(theme) => ({
        p: 2,
        mb: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.06),
        borderLeft: "4px solid",
        borderColor: "primary.main",
      })}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 1.5,
          fontWeight: 600,
          color: "text.primary",
          fontSize: "1.1rem",
        }}
      >
        Balance Summary
      </Typography>
      <Grid container spacing={2}>
        {SUMMARY_ITEMS.map((item) => (
          <SummaryItem
            key={item.key}
            label={item.label}
            value={balanceSummary[item.key]}
            color={item.color}
            format={(value) => item.format(value, record)}
          />
        ))}
      </Grid>
    </Paper>
  );
});

BalanceSummary.displayName = "BalanceSummary";

export default BalanceSummary;
