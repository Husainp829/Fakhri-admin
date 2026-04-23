import type { RaRecord } from "react-admin";
import type { SyntheticEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Datagrid,
  List,
  TextField,
  FunctionField,
  Button,
  DateInput,
  TextInput,
  useListContext,
  usePermissions,
  Pagination,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import { formatListDate } from "@/utils/date-format";
import {
  Box,
  Divider,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { exportToExcel } from "@/utils/export-to-excel";
import { hasPermission } from "@/utils/permission-utils";
import httpClient from "@/dataprovider/http-client";
import { getApiUrl } from "@/constants";

type SummaryTone = "warning" | "info" | "success";

const SUMMARY_CONFIG: { key: string; label: string; tone: SummaryTone }[] = [
  { key: "cash", label: "CASH", tone: "warning" },
  { key: "online", label: "ONLINE", tone: "info" },
  { key: "cheque", label: "CHEQUE", tone: "warning" },
  { key: "grandTotal", label: "GRAND TOTAL", tone: "success" },
];

type PaymentSummaryJson = Record<string, { total: number; count: number } | undefined> & {
  grandTotal?: { total: number; count: number };
};

const PaymentSummary = () => {
  const { filterValues } = useListContext();
  const [summary, setSummary] = useState<PaymentSummaryJson | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch summary if both startDate and endDate are provided
    if (filterValues?.startDate && filterValues?.endDate) {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterValues.startDate) queryParams.append("startDate", filterValues.startDate);
      if (filterValues.endDate) queryParams.append("endDate", filterValues.endDate);
      if (filterValues.paymentMode) queryParams.append("paymentMode", filterValues.paymentMode);
      if (filterValues.q) queryParams.append("q", String(filterValues.q));

      const url = `${getApiUrl(
        "lagatReceipts"
      )}/lagatReceipts/summary/payment-mode?${queryParams.toString()}`;

      httpClient(url)
        .then(({ json }) => {
          setSummary(json && typeof json === "object" ? (json as PaymentSummaryJson) : null);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching payment summary:", error);
          setLoading(false);
        });
    } else {
      setSummary(null);
    }
  }, [filterValues?.startDate, filterValues?.endDate, filterValues?.paymentMode, filterValues?.q]);

  if (!summary || loading) {
    return null;
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  // Filter summary config based on selected mode
  const getFilteredConfig = () => {
    if (filterValues?.paymentMode) {
      // Map mode to config key
      const modeToKey: Record<string, "cash" | "online" | "cheque"> = {
        CASH: "cash",
        ONLINE: "online",
        CHEQUE: "cheque",
      };
      const key = modeToKey[String(filterValues.paymentMode).toUpperCase()];
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
                sx={(theme) => ({
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  "& td": {
                    fontWeight: 600,
                    color: theme.palette.success.dark,
                    borderTop: `2px solid ${theme.palette.success.main}`,
                  },
                })}
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
                <TableRow
                  key={config.key}
                  hover
                  sx={(theme) => ({ bgcolor: alpha(theme.palette[config.tone].main, 0.12) })}
                >
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

const getTabIdFromFilters = (filters: { paymentMode?: string } | undefined) => {
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

  const handleChange = (_event: SyntheticEvent, value: string | number) => {
    const idx = typeof value === "number" ? value : Number(value);
    const selectedTab = TAB_OPTIONS[idx] || TAB_OPTIONS[0];
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
    <>
      <Box sx={{ mb: 0 }}>
        <Tabs value={tabValue} onChange={handleChange}>
          {TAB_OPTIONS.map((option) => (
            <Tab key={option.id} label={option.name} value={option.id} />
          ))}
        </Tabs>
      </Box>
      <Divider />
    </>
  );
};

const ReceiptDatagrid = () => {
  const printReceipt = (id: string | number) => {
    window.open(`#/lagat-rcpt/${id}`, "_blank");
  };

  return (
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="receiptNo" />
      <TextField source="name" />
      <TextField source="itsNo" label="ITS No." />
      <TextField source="amount" />
      <TextField source="purpose" emptyText="-" />
      <FunctionField
        label="Receipt date"
        source="receiptDate"
        render={(record: RaRecord) =>
          record.receiptDate ? (
            <span>{formatListDate(record.receiptDate as string)}</span>
          ) : (
            <span>—</span>
          )
        }
      />
      <FunctionField
        label="Download"
        source="formNo"
        render={(record: RaRecord) => (
          <Button onClick={() => printReceipt(record.id)}>
            <DownloadIcon />
          </Button>
        )}
        key="name"
      />
    </Datagrid>
  );
};

const LagatReceiptList = () => {
  const { permissions } = usePermissions();
  const filterRef = useRef<{ paymentMode: string }>({ paymentMode: "CASH" });

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

  // Create exporter that uses current filter from ref (updated by FilterSync component)
  const exporter = (records: RaRecord[]): void => {
    // Get current filter from ref
    const currentFilter = filterRef.current;

    // Get tab name for filename
    const currentTab = TAB_OPTIONS.find((tab) => tab.mode === currentFilter?.paymentMode);

    let tabNameForFile = "lagatreceipts";
    if (currentTab && currentTab.name) {
      // Remove all spaces and hyphens, convert to lowercase
      tabNameForFile = currentTab.name.toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
    } else if (currentFilter?.paymentMode) {
      // Fallback: use payment mode if tab not found
      tabNameForFile = currentFilter.paymentMode.toLowerCase();
    }

    const receiptColumns = [
      {
        header: "Receipt No",
        field: "receiptNo",
        width: 15,
      },
      {
        header: "Name",
        field: "name",
        width: 30,
      },
      {
        header: "ITS No.",
        field: "itsNo",
        width: 12,
      },
      {
        header: "Amount",
        field: "amount",
        width: 12,
      },
      {
        header: "Purpose",
        field: "purpose",
        width: 25,
      },
      {
        header: "Payment Mode",
        field: "paymentMode",
        width: 15,
      },
      {
        header: "Payment Ref",
        field: "paymentRef",
        width: 20,
      },
      {
        header: "Receipt Date",
        field: "receiptDate",
        width: 15,
        formatter: (_rec: RaRecord, v: unknown) => (v ? formatListDate(String(v)) : ""),
      },
    ];

    exportToExcel(receiptColumns, records, {
      filenamePrefix: `lagatreceipts-${tabNameForFile}`,
      sheetName: "Lagat Receipts",
    });
  };

  // Component to sync filter values to ref
  const FilterSync = () => {
    const { filterValues } = useListContext();
    useEffect(() => {
      if (filterValues?.paymentMode) {
        filterRef.current = { paymentMode: filterValues.paymentMode };
      }
    }, [filterValues]);
    return null;
  };

  const LagatFilters = [
    <TextInput source="q" label="Search name / ITS" key="q" alwaysOn sx={{ minWidth: 260 }} />,
    <DateInput source="startDate" label="Start Date" key="startDate" alwaysOn />,
    <DateInput source="endDate" label="End Date" key="endDate" alwaysOn />,
  ];

  return (
    <>
      <List
        sort={{ field: "receiptNo", order: "DESC" }}
        filters={LagatFilters}
        filterDefaultValues={getFilterFromURL()}
        exporter={hasPermission(permissions, "lagatReceipts.view") ? exporter : false}
        pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
      >
        <FilterSync />
        <PaymentModeTabs />
        <PaymentSummary />
        <ReceiptDatagrid />
      </List>
    </>
  );
};

export default LagatReceiptList;
