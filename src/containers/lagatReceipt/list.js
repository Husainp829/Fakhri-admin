import React, { useEffect, useState } from "react";
import {
  Datagrid,
  List,
  TextField,
  DateField,
  FunctionField,
  Button,
  DateInput,
  useListContext,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import httpClient from "../../dataprovider/httpClient";
import { getApiUrl } from "../../constants";
import CommonTabs from "../../components/CommonTabs";

const SUMMARY_CONFIG = [
  {
    key: "cash",
    label: "CASH",
    backgroundColor: "#fff3cd",
    borderColor: null,
    textColor: null,
  },
  {
    key: "online",
    label: "ONLINE",
    backgroundColor: "#d1ecf1",
    borderColor: null,
    textColor: null,
  },
  {
    key: "cheque",
    label: "CHEQUE",
    backgroundColor: "#fff3cd",
    borderColor: null,
    textColor: null,
  },
  {
    key: "grandTotal",
    label: "GRAND TOTAL",
    backgroundColor: "#d4edda",
    borderColor: "2px solid #28a745",
    textColor: "#155724",
  },
];

const PaymentSummary = () => {
  const { filterValues } = useListContext();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch summary if both startDate and endDate are provided
    if (filterValues?.startDate && filterValues?.endDate) {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterValues.startDate) queryParams.append("startDate", filterValues.startDate);
      if (filterValues.endDate) queryParams.append("endDate", filterValues.endDate);
      if (filterValues.paymentMode) queryParams.append("paymentMode", filterValues.paymentMode);

      const url = `${getApiUrl(
        "lagatReceipts"
      )}/lagatReceipts/summary/payment-mode?${queryParams.toString()}`;

      httpClient(url)
        .then(({ json }) => {
          setSummary(json);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching payment summary:", error);
          setLoading(false);
        });
    } else {
      setSummary(null);
    }
  }, [filterValues?.startDate, filterValues?.endDate, filterValues?.paymentMode]);

  if (!summary || loading) {
    return null;
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  // Filter summary config based on selected mode
  const getFilteredConfig = () => {
    if (filterValues?.paymentMode) {
      // Map mode to config key
      const modeToKey = {
        CASH: "cash",
        ONLINE: "online",
        CHEQUE: "cheque",
      };
      const key = modeToKey[filterValues.paymentMode.toUpperCase()];
      if (key) {
        // Only show the matching payment mode
        return SUMMARY_CONFIG.filter((config) => config.key === key);
      }
    }
    // If no mode filter, show all payment modes (but grand total will be shown separately at top)
    return SUMMARY_CONFIG.filter((config) => config.key !== "grandTotal");
  };

  const filteredConfig = getFilteredConfig();
  const grandTotalData = summary.grandTotal;

  return (
    <Box sx={{ mb: 3, p: 1 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
        Payment Summary
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Payment Mode</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Total Amount
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Count
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Show Grand Total at the top if no mode filter is applied */}
            {!filterValues?.paymentMode && grandTotalData && (
              <TableRow
                sx={{
                  backgroundColor: "#d4edda",
                  "& td": {
                    fontWeight: 600,
                    color: "#155724",
                    borderTop: "2px solid #28a745",
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>GRAND TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(grandTotalData.total)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {grandTotalData.count} receipt{grandTotalData.count !== 1 ? "s" : ""}
                </TableCell>
              </TableRow>
            )}
            {/* Show filtered payment modes */}
            {filteredConfig.map((config) => {
              const data = summary[config.key];
              if (!data) return null;
              return (
                <TableRow key={config.key} hover>
                  <TableCell>{config.label}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>
                    {formatCurrency(data.total)}
                  </TableCell>
                  <TableCell align="right">
                    {data.count} receipt{data.count !== 1 ? "s" : ""}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const TAB_OPTIONS = [
  { id: 0, name: "CASH", mode: "CASH" },
  { id: 1, name: "ONLINE", mode: "ONLINE" },
  { id: 2, name: "CHEQUE", mode: "CHEQUE" },
];

const getTabIdFromFilters = (filters) => {
  const tab = TAB_OPTIONS.findIndex((t) => t.mode === filters?.paymentMode);
  if (tab !== -1) {
    return tab;
  }
  return 0; // Default to CASH
};

const PaymentModeTabs = () => {
  const listContext = useListContext();
  const { filterValues, setFilters } = listContext;

  const [tabValue, setTabValue] = useState(getTabIdFromFilters(filterValues));

  const handleChange = (event, value) => {
    const selectedTab = TAB_OPTIONS[value] || TAB_OPTIONS[0];
    setFilters({
      ...filterValues,
      paymentMode: selectedTab.mode,
    });
  };

  useEffect(() => {
    const t = getTabIdFromFilters(filterValues);
    setTabValue(t);
  }, [filterValues]);

  return (
    <CommonTabs
      options={TAB_OPTIONS.map((option) => ({
        id: option.id,
        name: option.name,
      }))}
      value={tabValue}
      onChange={handleChange}
      showDivider
    />
  );
};

const ReceiptDatagrid = () => {
  const printReceipt = (id) => {
    window.open(`#/lagat-rcpt/${id}`, "_blank");
  };

  return (
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="receiptNo" />
      <TextField source="name" />
      <TextField source="itsNo" label="ITS No." />
      <TextField source="amount" />
      <TextField source="purpose" emptyText="-" />
      <DateField source="receiptDate" />
      <FunctionField
        label="Download"
        source="formNo"
        render={(record) => (
          <Button onClick={() => printReceipt(record.id)}>
            <DownloadIcon />
          </Button>
        )}
        key="name"
      />
    </Datagrid>
  );
};

export default () => {
  const LagatFilters = [
    <DateInput source="startDate" label="Start Date" key="startDate" alwaysOn />,
    <DateInput source="endDate" label="End Date" key="endDate" alwaysOn />,
  ];

  // Get filter from URL or default to CASH
  const getFilterFromURL = () => {
    if (typeof window === "undefined") return { paymentMode: "CASH" };

    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get("filter");

    if (filterParam) {
      try {
        const parsed = JSON.parse(filterParam);
        return {
          ...parsed,
          paymentMode: parsed.paymentMode || "CASH",
        };
      } catch (e) {
        console.error("Error parsing filter from URL:", e);
      }
    }

    return { paymentMode: "CASH" };
  };

  return (
    <>
      <List
        sort={{ field: "receiptNo", order: "DESC" }}
        filters={LagatFilters}
        filterDefaultValues={getFilterFromURL()}
      >
        <PaymentModeTabs />
        <PaymentSummary />
        <ReceiptDatagrid />
      </List>
    </>
  );
};
