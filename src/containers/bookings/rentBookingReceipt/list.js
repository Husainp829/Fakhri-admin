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
  SimpleList,
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
  Link,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
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
  { id: 0, name: "DEPOSIT - CASH", shortLabel: "Deposit", type: "DEPOSIT", mode: "CASH" },
  { id: 1, name: "CONTRIBUTIONS - CASH", shortLabel: "Cont. Cash", type: "RENT", mode: "CASH" },
  {
    id: 2,
    name: "CONTRIBUTIONS - ONLINE",
    shortLabel: "Cont. Online",
    type: "RENT",
    mode: "ONLINE",
  },
  {
    id: 3,
    name: "CONTRIBUTIONS - CHEQUE",
    shortLabel: "Cont. Cheque",
    type: "RENT",
    mode: "CHEQUE",
  },
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
        shortLabel: option.shortLabel,
      }))}
      value={tabValue}
      onChange={handleChange}
      showDivider
    />
  );
};

const formatAmount = (amount) =>
  amount != null
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount)
    : "—";

const ReceiptDatagrid = () => {
  const { filterValues } = useListContext();
  const { permissions } = usePermissions();
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  const isDeposit = filterValues?.type === "DEPOSIT";

  if (isSmall) {
    return (
      <SimpleList
        primaryText={(record) => `${record.receiptNo ?? "—"} · ${record.organiser ?? "—"}`}
        secondaryText={(record) => {
          const bookingNo = record?.booking?.bookingNo || record?.bookingId || "—";
          const dateStr = record.date ? dayjs(record.date).format("DD-MMM-YYYY") : "—";
          const amountStr = formatAmount(record.amount);
          const refundStr =
            isDeposit && record?.refundAmount != null
              ? ` · Refund ${formatAmount(record.refundAmount)}`
              : "";
          return (
            <>
              {bookingNo} · {record.organiserIts ?? "—"}
              <br />
              {dateStr} · {amountStr}
              {refundStr}
            </>
          );
        }}
        tertiaryText={(record) => record?.admin?.name || record.createdBy || "—"}
        linkType="edit"
        rowSx={() => ({ borderBottom: "1px solid #e0e0e0" })}
      />
    );
  }

  return (
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="receiptNo" />
      <FunctionField
        label="Booking"
        source="bookingId"
        render={(record) => {
          const bookingId = record?.booking?.id || record?.bookingId;
          const bookingNo = record?.booking?.bookingNo || record?.bookingId;
          if (!bookingId) return <span>-</span>;
          if (hasPermission(permissions, "bookings.view")) {
            return (
              <Link
                component={RouterLink}
                to={`/bookings/${bookingId}/show`}
                onClick={(e) => e.stopPropagation()}
              >
                {bookingNo}
              </Link>
            );
          }
          return <span>{bookingNo}</span>;
        }}
      />
      <TextField source="organiserIts" label="ITS No." />
      <TextField source="organiser" label="Organiser" />
      <DateField source="date" />
      <NumberField source="amount" />
      {isDeposit && (
        <FunctionField
          label="Refund Amount"
          source="refundAmount"
          render={(record) => {
            if (record?.refundAmount) {
              return formatAmount(record.refundAmount);
            }
            return <span>-</span>;
          }}
        />
      )}
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
};

export default () => {
  const { permissions } = usePermissions();
  const filterRef = React.useRef({ type: "DEPOSIT", mode: "CASH" });

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

  // Create exporter that uses current filter from ref (updated by FilterSync component)
  const exporter = (records) => {
    // Get current filter from ref
    const currentFilter = filterRef.current;

    const isDeposit = currentFilter?.type === "DEPOSIT";

    // Get tab name for filename
    const currentTab = TAB_OPTIONS.find(
      (tab) => tab.type === currentFilter?.type && tab.mode === currentFilter?.mode
    );

    let tabNameForFile = "receipts";
    if (currentTab && currentTab.name) {
      // Remove all spaces and hyphens, convert to lowercase
      tabNameForFile = currentTab.name.toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
    } else if (currentFilter?.type && currentFilter?.mode) {
      // Fallback: construct from filter values if tab not found
      // Normalize the type value (handle case where it might be "RENT" but we want "CONT")
      let typePart = currentFilter.type.toLowerCase();
      if (typePart === "rent") {
        typePart = "contributions";
      }
      const modePart = currentFilter.mode.toLowerCase();
      tabNameForFile = `${typePart}${modePart}`;
    }

    const receiptColumns = [
      {
        header: "Receipt No",
        field: "receiptNo",
        width: 15,
      },
      {
        header: "Booking No",
        field: (rec) => rec?.booking?.bookingNo || rec?.bookingId || "",
        width: 20,
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
      ...(isDeposit
        ? [
            {
              header: "Refund Amount",
              field: (rec) => rec?.refundAmount || 0,
              width: 15,
            },
          ]
        : []),
      {
        header: "Mode",
        field: "mode",
        width: 15,
      },
      {
        header: "Type",
        field: (rec) => (rec?.type === "RENT" ? "CONT" : rec?.type || ""),
        width: 15,
      },
      {
        header: "Created By",
        width: 20,
        field: (rec) => rec?.admin?.name || rec.createdBy || "",
      },
    ];

    return exportToExcel(receiptColumns, records, {
      filenamePrefix: `receipts-${tabNameForFile}`,
      sheetName: "Receipts",
    });
  };

  // Component to sync filter values to ref
  const FilterSync = () => {
    const { filterValues } = useListContext();
    useEffect(() => {
      if (filterValues?.type && filterValues?.mode) {
        filterRef.current = { type: filterValues.type, mode: filterValues.mode };
      }
    }, [filterValues]);
    return null;
  };

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

  return (
    <List
      hasCreate={false}
      exporter={hasPermission(permissions, "bookingReceipts.view") && exporter}
      pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
      sort={{ field: "date", order: "DESC" }}
      filters={ReceiptFilters}
      filterDefaultValues={getFilterFromURL()}
    >
      <FilterSync />
      <ReceiptTypeTabs />
      <PaymentSummary />
      <ReceiptDatagrid />
    </List>
  );
};
