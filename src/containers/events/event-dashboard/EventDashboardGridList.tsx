import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Button, downloadCSV, usePermissions } from "react-admin";
import jsonExport from "jsonexport/dist";
import DownloadIcon from "@mui/icons-material/Download";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { EventDashboardMarkazStats } from "./EventDashboardMarkazStats";
import { EventDashboardReceiptDayWise } from "./EventDashboardReceiptDayWise";
import { receiptGroupBy } from "@/utils";
import { hasPermission } from "@/utils/permission-utils";
import type {
  DayWiseReceiptReportRow,
  EventStatsNiyaazRow,
  ReceiptGroupedMap,
} from "@/containers/events/types";

type LoadedGridListProps = {
  niyaazCounts: EventStatsNiyaazRow[];
  receiptReport: DayWiseReceiptReportRow[];
  selectedMarkaz: string;
};

const LoadedGridList = ({ niyaazCounts, receiptReport, selectedMarkaz }: LoadedGridListProps) => {
  const { permissions } = usePermissions();
  const receiptMap: ReceiptGroupedMap = receiptGroupBy(receiptReport);

  const exporter = () => {
    const dailyReport = Object.entries(receiptMap?.[selectedMarkaz] || {}).map(([key, value]) => {
      const { CASH, CHEQUE, ONLINE } = value;
      return {
        DAY: key,
        CASH: CASH || 0,
        CHEQUE: CHEQUE || 0,
        ONLINE: ONLINE || 0,
      };
    });
    jsonExport(
      dailyReport,
      {
        headers: ["DAY", "CASH", "CHEQUE", "ONLINE"],
      },
      (_err, csv) => {
        downloadCSV(csv, "Daily Report");
      }
    );
  };

  return (
    <Grid container spacing={1} sx={{ mt: 3 }}>
      {hasPermission(permissions, "dashboard.markaz") && (
        <Grid sx={{ mb: 5 }} size={12}>
          <EventDashboardMarkazStats niyaazCounts={niyaazCounts} selectedMarkaz={selectedMarkaz} />
        </Grid>
      )}
      {hasPermission(permissions, "dashboard.daywiseReceipt") && (
        <>
          <Grid sx={{ mb: 5 }} size={12}>
            <Typography variant="h6" sx={{ mb: 0 }}>
              Day Wise Receipt Report
              <Button onClick={exporter}>
                <DownloadIcon />
              </Button>
            </Typography>
          </Grid>
          <EventDashboardReceiptDayWise receiptMap={receiptMap} selectedMarkaz={selectedMarkaz} />
        </>
      )}
    </Grid>
  );
};

type EventDashboardGridListProps = {
  isLoading?: boolean;
  niyaazCounts?: EventStatsNiyaazRow[];
  receiptReport?: DayWiseReceiptReportRow[];
  selectedMarkaz?: string;
};

export const EventDashboardGridList = ({
  isLoading,
  niyaazCounts = [],
  receiptReport = [],
  selectedMarkaz = "",
}: EventDashboardGridListProps) =>
  isLoading ? (
    <Backdrop sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })} open>
      <CircularProgress color="inherit" />
    </Backdrop>
  ) : (
    <LoadedGridList
      niyaazCounts={niyaazCounts}
      receiptReport={receiptReport}
      selectedMarkaz={selectedMarkaz}
    />
  );
