/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import {
  Datagrid,
  List,
  TextField,
  DateField,
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
import dayjs from "dayjs";
import { Box, Card, CardContent, Grid, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import httpClient from "../../../dataprovider/httpClient";
import { getApiUrl, SABIL_TYPE_OPTIONS } from "../../../constants";
import CommonTabs from "../../../components/CommonTabs";
import { exportToExcel } from "../../../utils/exportToExcel";
import { hasPermission } from "../../../utils/permissionUtils";

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
      if (filterValues.sabilId) queryParams.append("sabilId", filterValues.sabilId);
      if (filterValues.sabilType) queryParams.append("sabilType", filterValues.sabilType);
      if (filterValues.itsNo) queryParams.append("itsNo", filterValues.itsNo);

      const url = `${getApiUrl(
        "sabilReceipt"
      )}/sabilReceipt/summary/payment-mode?${queryParams.toString()}`;

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
    filterValues?.startDate,
    filterValues?.endDate,
    filterValues?.paymentMode,
    filterValues?.sabilId,
    filterValues?.sabilType,
    filterValues?.itsNo,
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

  return (
    <Box sx={{ mb: 3, p: 1 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
        Payment Summary
      </Typography>
      <Grid container spacing={1}>
        {SUMMARY_CONFIG.map((config) => {
          const data = summary[config.key];
          return (
            <Grid item size={{ xs: 6, md: 3 }} key={config.key}>
              <Card
                sx={{
                  p: 0,
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {config.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      ...(config.textColor && { color: config.textColor }),
                    }}
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

const getTabIdFromFilters = (filters) => {
  const t = SABIL_TYPE_OPTIONS.findIndex((s) => s.id === filters?.sabilType);
  if (t !== -1) {
    return t;
  }
  return 0; // Default to CHULA
};

const SabilTypeTabs = () => {
  const listContext = useListContext();
  const { filterValues, setFilters } = listContext;

  const [tabValue, setTabValue] = useState(getTabIdFromFilters(filterValues));

  const handleChange = (event, value) => {
    const newFilterValues = getFilterValues(value);
    setFilters({ ...filterValues, ...newFilterValues });
  };

  const getFilterValues = (tabId) => {
    const valueObj = SABIL_TYPE_OPTIONS[tabId] || SABIL_TYPE_OPTIONS[0];
    return {
      sabilType: valueObj.id,
    };
  };

  useEffect(() => {
    const t = getTabIdFromFilters(filterValues);
    setTabValue(t);
  }, [filterValues]);

  return (
    <CommonTabs
      options={SABIL_TYPE_OPTIONS.map((option, index) => ({
        id: index,
        name: option.name,
      }))}
      value={tabValue}
      onChange={handleChange}
      showDivider
      sx={{ indicatorColor: "primary" }}
    />
  );
};

const ReceiptDatagrid = () => {
  const printReceipt = (id) => {
    window.open(`#/sabil-receipt?receiptId=${id}`, "_blank");
  };

  return (
    <Datagrid rowClick="show">
      <TextField source="receiptNo" />
      <FunctionField
        label="Sabil No"
        render={(record) => (
          <Link
            component={RouterLink}
            to={`/sabilData/${record.sabilData.id}/show`}
            onClick={(e) => e.stopPropagation()}
          >
            {record.sabilData.sabilNo}
          </Link>
        )}
      />
      <FunctionField
        label="HOF ITS"
        render={(record) => (
          <Link
            component={RouterLink}
            to={`/sabilData/${record.sabilData.id}/show`}
            onClick={(e) => e.stopPropagation()}
          >
            {record.sabilData.itsNo}
          </Link>
        )}
      />
      <FunctionField
        label="Name"
        source="sabilData.name"
        render={(record) => record.sabilData.name || record.sabilData.itsdata?.Full_Name || "-"}
      />
      <TextField source="amount" />
      <DateField source="receiptDate" />
      <TextField source="remarks" />
      <TextField source="paymentMode" />
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
  const { permissions } = usePermissions();
  const filterRef = React.useRef({ sabilType: "CHULA" });

  // Get filter from URL or default to CHULA
  const getFilterFromURL = () => {
    if (typeof window === "undefined") return { sabilType: "CHULA" };

    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get("filter");

    if (filterParam) {
      try {
        const parsed = JSON.parse(filterParam);
        return { ...parsed, sabilType: parsed.sabilType || "CHULA" };
      } catch (e) {
        console.error("Error parsing filter from URL:", e);
      }
    }

    return { sabilType: "CHULA" };
  };

  // Create exporter that uses current filter from ref (updated by FilterSync component)
  const exporter = (records) => {
    // Get current filter from ref
    const currentFilter = filterRef.current;

    // Get tab name for filename
    const currentTab = SABIL_TYPE_OPTIONS.find((tab) => tab.id === currentFilter?.sabilType);

    let tabNameForFile = "sabilreceipts";
    if (currentTab && currentTab.name) {
      // Remove all spaces and hyphens, convert to lowercase
      tabNameForFile = currentTab.name.toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
    } else if (currentFilter?.sabilType) {
      // Fallback: use sabilType if tab not found
      tabNameForFile = currentFilter.sabilType.toLowerCase();
    }

    const receiptColumns = [
      {
        header: "Receipt No",
        field: "receiptNo",
        width: 15,
      },
      {
        header: "Sabil No",
        field: (rec) => rec?.sabilData?.sabilNo || "",
        width: 15,
      },
      {
        header: "HOF ITS",
        field: (rec) => rec?.sabilData?.itsNo || "",
        width: 12,
      },
      {
        header: "Name",
        field: (rec) => rec?.sabilData?.name || rec?.sabilData?.itsdata?.Full_Name || "",
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
        formatter: (rec, v) => (v ? dayjs(v).format("DD-MMM-YYYY") : ""),
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

  // Component to sync filter values to ref
  const FilterSync = () => {
    const { filterValues } = useListContext();
    useEffect(() => {
      if (filterValues?.sabilType) {
        filterRef.current = { sabilType: filterValues.sabilType };
      }
    }, [filterValues]);
    return null;
  };

  const ReceiptFilters = [
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
    <TextInput source="itsNo" label="ITS No" key="itsNo" alwaysOn />,
  ];

  return (
    <>
      <List
        sort={{ field: "receiptNo", order: "DESC" }}
        filters={ReceiptFilters}
        filterDefaultValues={getFilterFromURL()}
        exporter={hasPermission(permissions, "sabilReceipts.view") && exporter}
        pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
      >
        <FilterSync />
        <SabilTypeTabs />
        <PaymentSummary />
        <ReceiptDatagrid />
      </List>
    </>
  );
};
