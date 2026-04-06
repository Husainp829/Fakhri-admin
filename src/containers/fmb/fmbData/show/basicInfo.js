import React from "react";
import { useShowContext } from "react-admin";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { formatINR } from "@/utils";
import { formatFmbHijriPeriod } from "@/utils/hijri-date-utils";

const ISO_WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatWeekdays = (days) => {
  if (!Array.isArray(days) || days.length === 0) return "—";
  return days.map((d) => ISO_WEEKDAY_SHORT[(Number(d) - 1 + 7) % 7]).join(", ");
};

const formatDate = (value, empty = "—") => {
  if (!value) return empty;
  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatMoney = (n) => formatINR(n, { empty: "—" });

const formatHijriPeriod = (t) => {
  if (!t) return "—";
  const label = formatFmbHijriPeriod(t.hijriYearStart, t.hijriYearEnd);
  return label ?? "—";
};

const formatThaliLabel = (thali) => {
  const typeName = thali?.thaliType?.name;
  const base = `${thali.thaliNo}${typeName ? ` (${typeName})` : ""}${thali.isActive ? "" : " · inactive"}`;
  const addr = thali.deliveryAddress || thali.deliveryMohallah;
  return addr
    ? `${base} — ${[thali.deliveryAddress, thali.deliveryMohallah].filter(Boolean).join(", ")}`
    : base;
};

const InfoSection = ({ title, children }) => (
  <Paper
    elevation={1}
    sx={{
      p: 2,
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Typography
      variant="h6"
      sx={{
        mb: 1.5,
        pb: 0.75,
        borderBottom: "2px solid",
        borderColor: "primary.main",
        fontWeight: 600,
        color: "text.primary",
        fontSize: "1.1rem",
      }}
    >
      {title}
    </Typography>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>{children}</Box>
  </Paper>
);

const InfoField = ({ label, children }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ mt: 0.25 }}>
      {children ?? "—"}
    </Typography>
  </Box>
);

export default function BasicInfo() {
  const { record } = useShowContext();
  const [showThaliList, setShowThaliList] = React.useState(false);
  if (!record) {
    return null;
  }

  const profile = record.deliveryScheduleProfile;
  const t = record.fmbTakhmeenCurrent;
  const its = record.itsdata;
  const thalis = Array.isArray(record.thalis) ? record.thalis : [];
  const activeThaliCount = thalis.filter((thali) => thali.isActive).length;
  const hasMultipleThalis = thalis.length > 1;
  const displayName = its?.Full_Name || record.name || "—";
  let thaliContent = "—";
  if (thalis.length === 1) {
    thaliContent = formatThaliLabel(thalis[0]);
  } else if (hasMultipleThalis) {
    thaliContent = (
      <Box sx={{ mt: 0.25 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          <Chip size="small" color="primary" label={`${thalis.length} total`} />
          <Chip size="small" color="success" label={`${activeThaliCount} active`} />
          {thalis.length - activeThaliCount > 0 && (
            <Chip
              size="small"
              color="warning"
              label={`${thalis.length - activeThaliCount} inactive`}
            />
          )}
        </Stack>
        <Button
          size="small"
          sx={{ mt: 0.75, px: 0.5, minWidth: "auto" }}
          onClick={() => setShowThaliList((prev) => !prev)}
        >
          {showThaliList ? "Hide thali list" : "View thali list"}
        </Button>
        <Collapse in={showThaliList}>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: "wrap", rowGap: 1 }}>
            {thalis.map((thali) => (
              <Chip
                key={thali.id}
                size="small"
                color={thali.isActive ? "success" : "default"}
                label={formatThaliLabel(thali)}
              />
            ))}
          </Stack>
        </Collapse>
      </Box>
    );
  }
  const cutoffHint =
    profile && (profile.cutoffOffsetDays != null || profile.cutoffMinutes != null)
      ? `Cut-off: ${profile.cutoffOffsetDays ?? 0} day(s) before, ${profile.cutoffMinutes ?? 0} min from midnight`
      : null;

  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <InfoSection title="FMB record">
            <InfoField label="File no. (legacy)">{record.fileNo}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Delivery schedule">
              {profile ? `${profile.code} — ${profile.name}` : "—"}
            </InfoField>
            {profile?.deliveryWeekdays && (
              <>
                <Divider sx={{ my: 0.75 }} />
                <InfoField label="Delivery weekdays">
                  {formatWeekdays(profile.deliveryWeekdays)}
                </InfoField>
              </>
            )}
            {cutoffHint && (
              <>
                <Divider sx={{ my: 0.75 }} />
                <InfoField label="Schedule cut-off">{cutoffHint}</InfoField>
              </>
            )}
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Record created">{formatDate(record.createdAt)}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Last updated">{formatDate(record.updatedAt)}</InfoField>
          </InfoSection>
        </Grid>

        <Grid item xs={12} md={4}>
          <InfoSection title="Thalis & contact">
            <InfoField label={hasMultipleThalis ? "Thalis" : "Thali"}>{thaliContent}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Name">{displayName}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="ITS number">{record.itsNo || its?.ITS_ID}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Jamaat (ITS)">{its?.Jamaat}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Area (ITS)">{its?.Area}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Masool / sector incharge">{its?.Sector_Incharge_Name}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Address (ITS)">{its?.Address}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Mobile">{record.mobileNo}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="WhatsApp">{record.whatsappNo}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="PAN">{record.pan}</InfoField>
          </InfoSection>
        </Grid>

        <Grid item xs={12} md={4}>
          <InfoSection title="Status">
            <InfoField label="Last paid date">{formatDate(record.lastPaidDate, "-")}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Closed at">{formatDate(record.closedAt, "Open")}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Remarks">{record.remarks}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Transfer to">{record.transferTo}</InfoField>
          </InfoSection>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 1.5,
                pb: 0.75,
                borderBottom: "2px solid",
                borderColor: "primary.main",
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              Current takhmeen
            </Typography>
            {!t ? (
              <Typography variant="body2" color="text.secondary">
                No current takhmeen linked.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                    >
                      Takhmeen amount
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ mt: 0.5, fontWeight: 700, color: "primary.main" }}
                    >
                      {formatMoney(t.takhmeenAmount)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoField label="Pending balance">{formatMoney(t.pendingBalance)}</InfoField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoField label="Paid balance">{formatMoney(t.paidBalance)}</InfoField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoField label="Hijri period">{formatHijriPeriod(t)}</InfoField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoField label="Period start">{formatDate(t.startDate)}</InfoField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoField label="Takhmeen record created">{formatDate(t.createdAt)}</InfoField>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
