/* eslint-disable no-console */
import { useEffect, useState, useRef } from "react";
import type { Exporter, Identifier, RaRecord } from "react-admin";
import {
  Datagrid,
  List,
  TextField,
  FunctionField,
  Button,
  DateInput,
  SelectInput,
  TextInput,
  useListContext,
  usePermissions,
  Pagination,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import { formatListDate } from "@/utils/date-format";
import { Box, Card, CardContent, Divider, Link, Tab, Tabs, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { Link as RouterLink } from "react-router-dom";
import httpClient from "@/dataprovider/http-client";
import { getApiUrl, SABIL_TYPE_OPTIONS } from "@/constants";
import { exportToExcel } from "@/utils/export-to-excel";
import type { ExcelColumn } from "@/types/excel";
import { hasPermission } from "@/utils/permission-utils";

type PaymentModeSummary = { total: number; count: number };

type PaymentSummaryResponse = {
  cash?: PaymentModeSummary;
  online?: PaymentModeSummary;
  cheque?: PaymentModeSummary;
  grandTotal?: PaymentModeSummary;
};

type SummaryTone = "warning" | "info" | "success";

const SUMMARY_CONFIG: {
  key: keyof PaymentSummaryResponse;
  label: string;
  tone: SummaryTone;
}[] = [
  { key: "cash", label: "CASH", tone: "warning" },
  { key: "online", label: "ONLINE", tone: "info" },
  { key: "cheque", label: "CHEQUE", tone: "warning" },
  { key: "grandTotal", label: "GRAND TOTAL", tone: "success" },
];

const PaymentSummary = () => {
  const { filterValues } = useListContext();
  const [summary, setSummary] = useState<PaymentSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filterValues?.startDate && filterValues?.endDate) {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterValues.startDate) queryParams.append("startDate", String(filterValues.startDate));
      if (filterValues.endDate) queryParams.append("endDate", String(filterValues.endDate));
      if (filterValues.paymentMode)
        queryParams.append("paymentMode", String(filterValues.paymentMode));
      if (filterValues.sabilId) queryParams.append("sabilId", String(filterValues.sabilId));
      if (filterValues.sabilType) queryParams.append("sabilType", String(filterValues.sabilType));
      if (filterValues.q) queryParams.append("q", String(filterValues.q));

      const url = `${getApiUrl("sabilReceipt")}/sabilReceipt/summary/payment-mode?${queryParams.toString()}`;

      httpClient(url)
        .then(({ json }) => {
          setSummary(json as PaymentSummaryResponse);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching payment summary:", err);
          setLoading(false);
        });
    } else {
      setSummary(null);
    }
  }, [
    filterValues?.startDate,
    filterValues?.endDate,
    filterValues?.paymentMode,
    filterValues?.sabilId,
    filterValues?.sabilType,
    filterValues?.q,
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

  return (
    <Box sx={{ mb: 3, p: 1 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
        Payment Summary
      </Typography>
      <Grid container spacing={1}>
        {SUMMARY_CONFIG.map((config) => {
          const data = summary[config.key];
          if (!data) return null;
          return (
            <Grid key={config.key} size={{ xs: 6, md: 3 }}>
              <Card
                sx={(theme) => ({
                  p: 0,
                  bgcolor: alpha(theme.palette[config.tone].main, 0.12),
                  ...(config.tone === "success"
                    ? { borderTop: `2px solid ${theme.palette.success.main}` }
                    : {}),
                })}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {config.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={(theme) => ({
                      fontWeight: "bold",
                      ...(config.tone === "success" ? { color: theme.palette.success.dark } : {}),
                    })}
                  >
                    {formatCurrency(data.total)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.count} receipt{data.count !== 1 ? "s" : ""}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

const getTabIdFromFilters = (filters: Record<string, unknown>) => {
  const t = SABIL_TYPE_OPTIONS.findIndex((s) => s.id === filters?.sabilType);
  if (t !== -1) {
    return t;
  }
  return 0;
};

const SabilTypeTabs = () => {
  const listContext = useListContext();
  const { filterValues, setFilters } = listContext;

  const [tabValue, setTabValue] = useState(getTabIdFromFilters(filterValues));

  const getFilterValues = (tabId: number) => {
    const valueObj = SABIL_TYPE_OPTIONS[tabId] || SABIL_TYPE_OPTIONS[0];
    return {
      sabilType: valueObj.id,
    };
  };

  const handleChange = (_event: React.SyntheticEvent, value: string | number) => {
    const tabIndex = typeof value === "number" ? value : Number(value);
    const newFilterValues = getFilterValues(tabIndex);
    setFilters({ ...filterValues, ...newFilterValues });
  };

  useEffect(() => {
    const t = getTabIdFromFilters(filterValues);
    setTabValue(t);
  }, [filterValues]);

  return (
    <>
      <Box sx={{ mb: 0 }}>
        <Tabs value={tabValue} onChange={handleChange} indicatorColor="primary">
          {SABIL_TYPE_OPTIONS.map((option, index) => (
            <Tab key={option.id} label={option.name} value={index} />
          ))}
        </Tabs>
      </Box>
      <Divider />
    </>
  );
};

type ReceiptRow = RaRecord & {
  sabilData?: RaRecord & {
    id?: string;
    sabilNo?: string;
    itsNo?: string;
    name?: string;
    itsdata?: { Full_Name?: string };
  };
};

const ReceiptDatagrid = () => {
  const printReceipt = (id: string | number) => {
    window.open(`#/sabil-receipt?receiptId=${id}`, "_blank");
  };

  return (
    <Datagrid rowClick="show">
      <TextField source="receiptNo" />
      <FunctionField
        label="Sabil No"
        render={(record: ReceiptRow) => (
          <Link
            component={RouterLink}
            to={`/sabilData/${record.sabilData?.id}/show`}
            onClick={(e) => e.stopPropagation()}
          >
            {record.sabilData?.sabilNo}
          </Link>
        )}
      />
      <FunctionField
        label="HOF ITS"
        render={(record: ReceiptRow) => (
          <Link
            component={RouterLink}
            to={`/sabilData/${record.sabilData?.id}/show`}
            onClick={(e) => e.stopPropagation()}
          >
            {record.sabilData?.itsNo}
          </Link>
        )}
      />
      <FunctionField
        label="Name"
        source="sabilData.name"
        render={(record: ReceiptRow) =>
          record.sabilData?.name || record.sabilData?.itsdata?.Full_Name || "-"
        }
      />
      <TextField source="amount" />
      <FunctionField
        label="Receipt date"
        source="receiptDate"
        render={(record: ReceiptRow) =>
          record.receiptDate ? (
            <span>{formatListDate(record.receiptDate as string)}</span>
          ) : (
            <span>—</span>
          )
        }
      />
      <TextField source="remarks" />
      <TextField source="paymentMode" />
      <FunctionField
        label="Download"
        source="formNo"
        render={(record: ReceiptRow) => (
          <Button onClick={() => printReceipt(record.id)}>
            <DownloadIcon />
          </Button>
        )}
      />
    </Datagrid>
  );
};

const getFilterFromURL = () => {
  if (typeof window === "undefined") return { sabilType: "CHULA" };

  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get("filter");

  if (filterParam) {
    try {
      const parsed = JSON.parse(filterParam) as Record<string, unknown>;
      return { ...parsed, sabilType: (parsed.sabilType as string) || "CHULA" };
    } catch (e) {
      console.error("Error parsing filter from URL:", e);
    }
  }

  return { sabilType: "CHULA" };
};

const ReceiptFilters = [
  <TextInput
    source="q"
    label="Search name / surname / ITS"
    key="q"
    alwaysOn
    sx={{ minWidth: 260 }}
  />,
  <DateInput source="startDate" label="Start Date" key="startDate" alwaysOn />,
  <DateInput source="endDate" label="End Date" key="endDate" alwaysOn />,
  <SelectInput
    source="paymentMode"
    label="Payment Mode"
    choices={[
      { id: "CASH", name: "CASH" },
      { id: "ONLINE", name: "ONLINE" },
      { id: "CHEQUE", name: "CHEQUE" },
    ]}
    key="paymentMode"
    alwaysOn
  />,
];

const SabilReceiptList = () => {
  const { permissions } = usePermissions();
  const filterRef = useRef<{ sabilType: string }>({ sabilType: "CHULA" });

  const exporter = (records: RaRecord[]) => {
    const currentFilter = filterRef.current;

    const currentTab = SABIL_TYPE_OPTIONS.find((tab) => tab.id === currentFilter?.sabilType);

    let tabNameForFile = "sabilreceipts";
    if (currentTab?.name) {
      tabNameForFile = currentTab.name.toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
    } else if (currentFilter?.sabilType) {
      tabNameForFile = currentFilter.sabilType.toLowerCase();
    }

    const receiptColumns: ExcelColumn<RaRecord<Identifier>>[] = [
      {
        header: "Receipt No",
        field: "receiptNo",
        width: 15,
      },
      {
        header: "Sabil No",
        field: (rec) => (rec as ReceiptRow)?.sabilData?.sabilNo || "",
        width: 15,
      },
      {
        header: "HOF ITS",
        field: (rec) => (rec as ReceiptRow)?.sabilData?.itsNo || "",
        width: 12,
      },
      {
        header: "Name",
        field: (rec) =>
          (rec as ReceiptRow)?.sabilData?.name ||
          (rec as ReceiptRow)?.sabilData?.itsdata?.Full_Name ||
          "",
        width: 30,
      },
      {
        header: "Amount",
        field: "amount",
        width: 12,
      },
      {
        header: "Receipt Date",
        field: "receiptDate",
        width: 15,
        formatter: (_rec, v) => (v ? formatListDate(String(v)) : ""),
      },
      {
        header: "Payment Mode",
        field: "paymentMode",
        width: 15,
      },
    ];

    return exportToExcel(receiptColumns, records, {
      filenamePrefix: `sabilreceipts-${tabNameForFile}`,
      sheetName: "Sabil Receipts",
    });
  };

  const FilterSync = () => {
    const { filterValues } = useListContext();
    useEffect(() => {
      if (filterValues?.sabilType) {
        filterRef.current = { sabilType: String(filterValues.sabilType) };
      }
    }, [filterValues]);
    return null;
  };

  return (
    <List
      sort={{ field: "receiptNo", order: "DESC" }}
      filters={ReceiptFilters}
      filterDefaultValues={getFilterFromURL()}
      exporter={
        hasPermission(permissions, "sabilReceipts.view")
          ? (exporter as unknown as Exporter<RaRecord<Identifier>>)
          : false
      }
      pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
    >
      <FilterSync />
      <SabilTypeTabs />
      <PaymentSummary />
      <ReceiptDatagrid />
    </List>
  );
};

export default SabilReceiptList;
