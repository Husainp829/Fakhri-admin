import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useShowContext } from "react-admin";
import { Grid, Paper, Typography, Box } from "@mui/material";
import { callApi } from "../../../../dataprovider/miscApis";

// Summary item configuration
const SUMMARY_ITEMS = [
  {
    key: "pendingBalance",
    label: "Pending Balance",
    color: "error.main",
    format: (value) => `₹${(value || 0).toLocaleString("en-IN")}`,
  },
  {
    key: "lastPaidMonth",
    label: "Last Paid",
    color: "text.primary",
    format: (value, record) => {
      if (!value) return "N/A";
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

      // Check if it's an establishment sabil
      const isEstablishment = record?.sabilType === "ESTABLISHMENT";

      // For establishment, if month is April (4), show range April {year} to March {year+1}
      if (isEstablishment && value.month === 4) {
        return `${fullMonthNames[3]} ${value.year} to ${fullMonthNames[2]} ${value.year + 1}`;
      }

      const monthName = monthNames[value.month - 1] || value.month;
      return `${monthName} - ${value.year}`;
    },
  },
  {
    key: "writtenOffAmount",
    label: "Written Off Amount",
    color: "warning.main",
    format: (value) => `₹${(value || 0).toLocaleString("en-IN")}`,
  },
];

// Reusable summary item component
const SummaryItem = ({ label, value, color, format }) => (
  <Grid item xs={12} sm={6} md={3}>
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

const BalanceSummary = forwardRef((props, ref) => {
  const { record } = useShowContext();
  const [balanceSummary, setBalanceSummary] = useState(null);
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
      if (response?.data?.rows?.[0]) {
        setBalanceSummary(response.data.rows[0]);
      } else if (response?.data) {
        setBalanceSummary(response.data);
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

  // Expose refresh function via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchBalanceSummary,
  }));

  if (isLoading || !balanceSummary) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: "#f8f9fa",
        borderLeft: "4px solid",
        borderColor: "primary.main",
      }}
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
