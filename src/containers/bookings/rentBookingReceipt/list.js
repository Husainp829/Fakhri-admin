import React, { useEffect, useState } from "react";
import {
  Datagrid,
  List,
  NumberField,
  TextField,
  DateField,
  FunctionField,
  Button,
  usePermissions,
  Pagination,
  TextInput,
  DateInput,
  useListContext,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import dayjs from "dayjs";
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
import { exportToExcel } from "../../../utils/exportToExcel";
import { hasPermission } from "../../../utils/permissionUtils";
import CommonTabs from "../../../components/CommonTabs";
import httpClient from "../../../dataprovider/httpClient";
import { getApiUrl } from "../../../constants";

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
    // Only fetch summary if both start and end dates are provided
    if (filterValues?.start && filterValues?.end) {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterValues.start) queryParams.append("start", filterValues.start);
      if (filterValues.end) queryParams.append("end", filterValues.end);
      if (filterValues.type) queryParams.append("type", filterValues.type);
      if (filterValues.mode) queryParams.append("mode", filterValues.mode);
      if (filterValues.organiserIts) queryParams.append("organiserIts", filterValues.organiserIts);
      if (filterValues.receiptNo) queryParams.append("receiptNo", filterValues.receiptNo);

      const url = `${getApiUrl(
        "contRcpt"
      )}/contRcpt/summary/payment-mode?${queryParams.toString()}`;

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
  }, [
    filterValues?.start,
    filterValues?.end,
    filterValues?.type,
    filterValues?.mode,
    filterValues?.organiserIts,
    filterValues?.receiptNo,
  ]);

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
    if (filterValues?.mode) {
      // Map mode to config key
      const modeToKey = {
        CASH: "cash",
        ONLINE: "online",
        CHEQUE: "cheque",
      };
      const key = modeToKey[filterValues.mode.toUpperCase()];
      if (key) {
        // Only show the matching payment mode
        return SUMMARY_CONFIG.filter((config) => config.key === key);
      }
    }
    // If no mode filter, show all payment modes (but grand total will be shown separately at top)
    return SUMMARY_CONFIG.filter((config) => config.key !== "grandTotal");
  };

  const filteredConfig = getFilteredConfig();

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
  { id: 0, name: "DEPOSIT - CASH", type: "DEPOSIT", mode: "CASH" },
  { id: 1, name: "CONTRIBUTIONS - CASH", type: "RENT", mode: "CASH" },
  { id: 2, name: "CONTRIBUTIONS - ONLINE", type: "RENT", mode: "ONLINE" },
  { id: 3, name: "CONTRIBUTIONS - CHEQUE", type: "RENT", mode: "CHEQUE" },
];

const getTabIdFromFilters = (filters) => {
  const tab = TAB_OPTIONS.findIndex((t) => t.type === filters?.type && t.mode === filters?.mode);
  if (tab !== -1) {
    return tab;
  }
  return 0; // Default to DEPOSIT - CASH
};

const ReceiptTypeTabs = () => {
  const listContext = useListContext();
  const { filterValues, setFilters } = listContext;

  const [tabValue, setTabValue] = useState(getTabIdFromFilters(filterValues));

  const handleChange = (event, value) => {
    const selectedTab = TAB_OPTIONS[value] || TAB_OPTIONS[0];
    setFilters({
      ...filterValues,
      type: selectedTab.type,
      mode: selectedTab.mode,
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

const ReceiptDatagrid = () => (
  <Datagrid rowClick="edit" bulkActionButtons={false}>
    <TextField source="receiptNo" />
    <TextField source="organiserIts" label="ITS No." />
    <TextField source="organiser" label="Organiser" />
    <DateField source="date" />
    <NumberField source="amount" />
    <FunctionField
      label="Created By"
      source="createdBy"
      render={(record) => <span>{record?.admin?.name || record.createdBy}</span>}
    />
    <FunctionField
      label="Download"
      source="formNo"
      render={(record) => (
        <Button
          onClick={() => {
            window.open(`#/cont-rcpt/${record.id}`, "_blank");
          }}
        >
          <DownloadIcon />
        </Button>
      )}
      key="name"
    />
  </Datagrid>
);

export default () => {
  const { permissions } = usePermissions();

  const receiptColumns = [
    {
      header: "Receipt No",
      field: "receiptNo",
      width: 15,
    },
    {
      header: "ITS No.",
      field: "organiserIts",
      width: 12,
    },
    {
      header: "Organiser",
      field: "organiser",
      width: 25,
    },
    {
      header: "Date",
      field: "date",
      width: 15,
      formatter: (rec, v) => (v ? dayjs(v).format("DD-MMM-YYYY") : ""),
    },
    {
      header: "Amount",
      field: "amount",
      width: 12,
    },
    {
      header: "Mode",
      field: "mode",
      width: 15,
    },
    {
      header: "Type",
      field: "type",
      width: 15,
    },
    {
      header: "Created By",
      width: 20,
      field: (rec) => rec?.admin?.name || rec.createdBy || "",
    },
    // 🚫 Do NOT export the "Download" button — not relevant in Excel
  ];
  const exporter = (records) =>
    exportToExcel(receiptColumns, records, {
      filenamePrefix: "receipts",
      sheetName: "Receipts",
    });

  const ReceiptFilters = [
    <TextInput
      label="Search By Organiser ITS"
      source="organiserIts"
      alwaysOn
      key={0}
      sx={{ minWidth: 300 }}
    />,
    <DateInput source="start" label="from" alwaysOn key={1} />,
    <DateInput source="end" label="to" alwaysOn key={2} />,
    <TextInput label="Search By Receipt No" source="receiptNo" key={0} sx={{ minWidth: 300 }} />,
  ];

  // Get filter from URL or default to DEPOSIT - CASH
  const getFilterFromURL = () => {
    if (typeof window === "undefined") return { type: "DEPOSIT", mode: "CASH" };

    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get("filter");

    if (filterParam) {
      try {
        const parsed = JSON.parse(filterParam);
        return {
          ...parsed,
          type: parsed.type || "DEPOSIT",
          mode: parsed.mode || "CASH",
        };
      } catch (e) {
        console.error("Error parsing filter from URL:", e);
      }
    }

    return { type: "DEPOSIT", mode: "CASH" };
  };

  return (
    <List
      hasCreate={false}
      exporter={hasPermission(permissions, "receipts.export") && exporter}
      pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
      sort={{ field: "date", order: "DESC" }}
      filters={ReceiptFilters}
      filterDefaultValues={getFilterFromURL()}
    >
      <ReceiptTypeTabs />
      <PaymentSummary />
      <ReceiptDatagrid />
    </List>
  );
};
