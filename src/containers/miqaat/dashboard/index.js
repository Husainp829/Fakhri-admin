import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Title,
  List,
  Datagrid,
  SimpleList,
  TextField as RATextField,
  DateField,
  FunctionField,
  useRedirect,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import { callApi } from "../../../dataprovider/miscApis";
import CommonTabs from "../../../components/CommonTabs";

const MiqaatNiyaazDashboard = () => {
  const redirect = useRedirect();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [paymentModeTab, setPaymentModeTab] = useState("CASH");
  const [financialYear, setFinancialYear] = useState(() => {
    const now = dayjs();
    const month = now.month() + 1; // 1-12
    const year = now.year();
    if (month >= 4) {
      return `${year}-${year + 1}`;
    }
    return `${year - 1}-${year}`;
  });

  const fetchLedgerReport = async (paymentMode) => {
    setLoading(true);
    try {
      const response = await callApi({
        location: "miqaatNiyaazReceipts",
        method: "GET",
        id: `ledger/report${financialYear ? `?financialYear=${financialYear}` : ""}${
          paymentMode ? `&paymentMode=${paymentMode}` : ""
        }`,
      });
      if (response?.data) {
        setReportData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch ledger report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerReport(paymentModeTab);
  }, [financialYear, paymentModeTab]);

  const generateFinancialYearOptions = () => {
    const options = [];
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1;

    // Generate options for last 5 years and next 2 years
    for (let i = -5; i <= 2; i += 1) {
      const year = currentYear + i;
      if (i === 0 && currentMonth < 4) {
        // Current FY if we're before April
        options.push({ value: `${year - 1}-${year}`, label: `${year - 1}-${year}` });
      } else if (i === 0 && currentMonth >= 4) {
        // Current FY if we're in or after April
        options.push({ value: `${year}-${year + 1}`, label: `${year}-${year + 1}` });
      } else {
        const startYear = year;
        const endYear = year + 1;
        options.push({ value: `${startYear}-${endYear}`, label: `${startYear}-${endYear}` });
      }
    }
    return options.reverse();
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  // Calculate financial year date range
  const getFinancialYearDateRange = (fy) => {
    const [startYear, endYear] = fy.split("-").map(Number);
    return {
      startDate: `${startYear}-04-01`,
      endDate: `${endYear}-03-31`,
    };
  };

  const fyDateRange = getFinancialYearDateRange(financialYear);

  // Summary Cards Configuration
  const summaryCardsConfig = [
    {
      key: "creditTotal",
      label: "TOTAL CREDIT",
      getValue: (data, mode) => (mode === "CASH" ? data.creditTotalCash : data.creditTotalOnline),
      colorCondition: () => true,
      colorPositive: "success.main",
      colorNegative: "success.main",
    },
    {
      key: "debitTotal",
      label: "TOTAL DEBIT",
      getValue: (data, mode) => (mode === "CASH" ? data.debitTotalCash : data.debitTotalOnline),
      colorCondition: () => true,
      colorPositive: "error.main",
      colorNegative: "error.main",
    },
    {
      key: "openingBalance",
      label: "OPENING BALANCE",
      getValue: (data, mode) =>
        mode === "CASH" ? data.openingBalanceCash : data.openingBalanceOnline,
      colorCondition: (value) => value >= 0,
      colorPositive: "success.main",
      colorNegative: "error.main",
    },
    {
      key: "closingBalance",
      label: "CLOSING BALANCE",
      getValue: (data, mode) =>
        mode === "CASH" ? data.closingBalanceCash : data.closingBalanceOnline,
      colorCondition: (value) => value >= 0,
      colorPositive: "success.main",
      colorNegative: "error.main",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Title title="Miqaat Niyaaz Ledger Dashboard" />
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Title title="Miqaat Niyaaz Ledger Dashboard" />

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          select
          label="Financial Year"
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
          sx={{ minWidth: 200 }}
          size="small"
        >
          {generateFinancialYearOptions().map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" onClick={() => fetchLedgerReport(paymentModeTab)}>
          Refresh
        </Button>
      </Box>

      {reportData && (
        <>
          {/* Payment Mode Tabs */}
          <CommonTabs
            options={[
              { id: "CASH", name: "CASH" },
              { id: "ONLINE", name: "ONLINE" },
            ]}
            value={paymentModeTab}
            onChange={(e, newValue) => setPaymentModeTab(newValue)}
          />

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {summaryCardsConfig.map((card) => {
              const value = card.getValue(reportData, paymentModeTab);
              const color = card.colorCondition(value) ? card.colorPositive : card.colorNegative;

              return (
                <Grid key={card.key} item size={{ xs: 6, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        {card.label}
                      </Typography>
                      <Typography variant="h5" color={color}>
                        {formatCurrency(value)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Ledger Entries List */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ledger Entries - {reportData.entryCount}
              </Typography>
              <List
                resource="miqaatNiyaazReceipts"
                filter={{
                  receiptDate_gte: fyDateRange.startDate,
                  receiptDate_lte: fyDateRange.endDate,
                  paymentMode: paymentModeTab,
                }}
                sort={{ field: "receiptDate", order: "DESC" }}
                disableSyncWithLocation
                perPage={50}
                actions={
                  <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", p: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => redirect("/miqaatNiyaazReceipts/create")}
                    >
                      Create
                    </Button>
                  </Box>
                }
              >
                {isMobile ? (
                  <SimpleList
                    primaryText={(record) => record.name}
                    secondaryText={(record) => (
                      <Box>
                        <Typography variant="body2">
                          {dayjs(record.receiptDate).format("DD/MM/YYYY")} •{" "}
                          <span
                            style={{
                              color: record.receiptType === "CREDIT" ? "green" : "red",
                              fontWeight: "bold",
                            }}
                          >
                            {record.receiptType}
                          </span>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {record.purpose}
                          {record.paymentRef && ` • Ref: ${record.paymentRef}`}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={record.receiptType === "CREDIT" ? "success.main" : "error.main"}
                        >
                          {record.receiptType === "CREDIT" ? "+" : "-"}
                          {formatCurrency(record.amount)}
                        </Typography>
                      </Box>
                    )}
                    tertiaryText={(record) =>
                      record.receiptType === "CREDIT" && record.receiptNo ? record.receiptNo : null
                    }
                    rightIcon={(record) => (
                      <Box
                        sx={{ display: "flex", gap: 0.5, marginTop: "3rem", alignItems: "center" }}
                      >
                        {record.receiptType === "CREDIT" && record.receiptNo && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`#/mqt-rcpt/${record.id}`, "_blank");
                            }}
                            sx={{ color: "primary.main" }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            redirect(`/miqaatNiyaazReceipts/${record.id}`);
                          }}
                          sx={{ color: "primary.main" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  />
                ) : (
                  <Datagrid bulkActionButtons={false}>
                    <DateField source="receiptDate" label="Date" />
                    <FunctionField
                      label="Type"
                      render={(record) => (
                        <Typography
                          variant="body2"
                          color={record.receiptType === "CREDIT" ? "success.main" : "error.main"}
                          fontWeight="bold"
                        >
                          {record.receiptType}
                        </Typography>
                      )}
                    />
                    <RATextField source="receiptNo" label="Receipt No" />
                    <RATextField source="name" label="Name" />
                    <RATextField source="itsNo" label="ITS No" />
                    <RATextField source="purpose" label="Purpose" />
                    <FunctionField
                      label="Amount"
                      render={(record) => (
                        <Typography
                          variant="body2"
                          color={record.receiptType === "CREDIT" ? "success.main" : "error.main"}
                          fontWeight="bold"
                        >
                          {record.receiptType === "CREDIT" ? "+" : "-"}
                          {formatCurrency(record.amount)}
                        </Typography>
                      )}
                    />
                    <RATextField source="paymentMode" label="Payment Mode" />
                    <RATextField source="paymentRef" label="Payment Reference" />
                    <FunctionField
                      label="Download"
                      render={(record) =>
                        record.receiptType === "CREDIT" && record.receiptNo ? (
                          <IconButton
                            onClick={() => {
                              window.open(`#/mqt-rcpt/${record.id}`, "_blank");
                            }}
                            size="small"
                          >
                            <DownloadIcon />
                          </IconButton>
                        ) : (
                          <span>-</span>
                        )
                      }
                    />
                    <FunctionField
                      label="Edit"
                      render={(record) => (
                        <IconButton
                          onClick={() => redirect(`/miqaatNiyaazReceipts/${record.id}`)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    />
                  </Datagrid>
                )}
              </List>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default MiqaatNiyaazDashboard;
