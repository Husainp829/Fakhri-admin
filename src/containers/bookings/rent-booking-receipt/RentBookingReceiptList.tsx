import { useEffect, useState, useRef } from "react";
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
import type { RaRecord } from "react-admin";
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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { exportToExcel } from "@/utils/export-to-excel";
import { hasPermission } from "@/utils/permission-utils";
import CommonTabs from "@/components/common-tabs";
import httpClient from "@/dataprovider/http-client";
import { getApiUrl } from "@/constants";

type SummaryModeRow = { total: number; count: number };

type PaymentSummaryJson = {
  cash?: SummaryModeRow;
  online?: SummaryModeRow;
  cheque?: SummaryModeRow;
  grandTotal?: SummaryModeRow;
};

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
] as const;

const PaymentSummary = () => {
  const { filterValues } = useListContext();
  const [summary, setSummary] = useState<PaymentSummaryJson | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filterValues?.start && filterValues?.end) {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterValues.start) queryParams.append("start", String(filterValues.start));
      if (filterValues.end) queryParams.append("end", String(filterValues.end));
      if (filterValues.type) queryParams.append("type", String(filterValues.type));
      if (filterValues.mode) queryParams.append("mode", String(filterValues.mode));
      if (filterValues.organiserIts)
        queryParams.append("organiserIts", String(filterValues.organiserIts));
      if (filterValues.receiptNo) queryParams.append("receiptNo", String(filterValues.receiptNo));

      const url = `${getApiUrl("contRcpt")}/contRcpt/summary/payment-mode?${queryParams.toString()}`;

      httpClient(url)
        .then(({ json }) => {
          setSummary(json as PaymentSummaryJson);
          setLoading(false);
        })
        .catch((error: unknown) => {
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const getFilteredConfig = () => {
    if (filterValues?.mode) {
      const modeToKey: Record<string, "cash" | "online" | "cheque"> = {
        CASH: "cash",
        ONLINE: "online",
        CHEQUE: "cheque",
      };
      const key = modeToKey[String(filterValues.mode).toUpperCase()];
      if (key) {
        return SUMMARY_CONFIG.filter((config) => config.key === key);
      }
    }
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
            {filteredConfig.map((config) => {
              const data = summary[config.key as keyof PaymentSummaryJson] as
                | SummaryModeRow
                | undefined;
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
] as const;

const getTabIdFromFilters = (filters: Record<string, unknown> | undefined) => {
  const tab = TAB_OPTIONS.findIndex((t) => t.type === filters?.type && t.mode === filters?.mode);
  if (tab !== -1) {
    return tab;
  }
  return 0;
};

const ReceiptTypeTabs = () => {
  const listContext = useListContext();
  const { filterValues, setFilters } = listContext;

  const [tabValue, setTabValue] = useState(() => getTabIdFromFilters(filterValues));

  const handleChange = (_event: React.SyntheticEvent, value: string | number) => {
    const idx = typeof value === "number" ? value : Number(value);
    const selectedTab = TAB_OPTIONS[idx] || TAB_OPTIONS[0];
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

const ReceiptDatagrid = () => {
  const { filterValues } = useListContext();
  const { permissions } = usePermissions();
  const isDeposit = filterValues?.type === "DEPOSIT";

  return (
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="receiptNo" />
      <FunctionField
        label="Booking"
        source="bookingId"
        render={(rec: RaRecord) => {
          const bookingId = (rec?.booking as { id?: string } | undefined)?.id || rec?.bookingId;
          const bookingNo =
            (rec?.booking as { bookingNo?: string } | undefined)?.bookingNo || rec?.bookingId;
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
          render={(rec: RaRecord) => {
            if (rec?.refundAmount) {
              return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(Number(rec.refundAmount));
            }
            return <span>-</span>;
          }}
        />
      )}
      <FunctionField
        label="Created By"
        source="createdBy"
        render={(rec: RaRecord) => (
          <span>{(rec?.admin as { name?: string } | undefined)?.name || rec.createdBy}</span>
        )}
      />
      <FunctionField
        label="Download"
        source="formNo"
        render={(rec: RaRecord) => (
          <Button
            onClick={() => {
              window.open(`#/cont-rcpt/${rec.id}`, "_blank");
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

const getFilterFromURL = (): { type: string; mode: string } => {
  if (typeof window === "undefined") return { type: "DEPOSIT", mode: "CASH" };

  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get("filter");

  if (filterParam) {
    try {
      const parsed = JSON.parse(filterParam) as Record<string, string>;
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

export const RentBookingReceiptList = () => {
  const { permissions } = usePermissions();
  const filterRef = useRef<{ type: string; mode: string }>({ type: "DEPOSIT", mode: "CASH" });

  const exporter = (records: RaRecord[]): void => {
    const currentFilter = filterRef.current;

    const isDeposit = currentFilter?.type === "DEPOSIT";

    const currentTab = TAB_OPTIONS.find(
      (tab) => tab.type === currentFilter?.type && tab.mode === currentFilter?.mode
    );

    let tabNameForFile = "receipts";
    if (currentTab?.name) {
      tabNameForFile = currentTab.name.toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
    } else if (currentFilter?.type && currentFilter?.mode) {
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
        field: (rec: RaRecord) =>
          (rec?.booking as { bookingNo?: string } | undefined)?.bookingNo || rec?.bookingId || "",
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
        formatter: (_rec: RaRecord, v: unknown) =>
          v ? dayjs(v as string).format("DD-MMM-YYYY") : "",
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
              field: (rec: RaRecord) => rec?.refundAmount || 0,
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
        field: (rec: RaRecord) => (rec?.type === "RENT" ? "CONT" : rec?.type || ""),
        width: 15,
      },
      {
        header: "Created By",
        width: 20,
        field: (rec: RaRecord) =>
          (rec?.admin as { name?: string } | undefined)?.name || rec.createdBy || "",
      },
    ];

    exportToExcel(receiptColumns, records, {
      filenamePrefix: `receipts-${tabNameForFile}`,
      sheetName: "Receipts",
    });
  };

  const FilterSync = () => {
    const { filterValues } = useListContext();
    useEffect(() => {
      if (filterValues?.type && filterValues?.mode) {
        filterRef.current = { type: String(filterValues.type), mode: String(filterValues.mode) };
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
    <TextInput label="Search By Receipt No" source="receiptNo" key={3} sx={{ minWidth: 300 }} />,
  ];

  return (
    <>
      <List
        exporter={hasPermission(permissions, "bookingReceipts.view") ? exporter : false}
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
    </>
  );
};

export default RentBookingReceiptList;
