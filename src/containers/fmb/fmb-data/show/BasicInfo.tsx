import React from "react";
import { useShowContext } from "react-admin";
import { Box, Button, Chip, Collapse, Divider, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { formatINR } from "@/utils";
import { formatListDate } from "@/utils/date-format";
import { formatFmbHijriPeriod } from "@/utils/hijri-date-utils";

const ISO_WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatWeekdays = (days: unknown) => {
  if (!Array.isArray(days) || days.length === 0) return "—";
  return days.map((d) => ISO_WEEKDAY_SHORT[(Number(d) - 1 + 7) % 7]).join(", ");
};

const formatMoney = (n: unknown) => formatINR(n, { empty: "—" });

const formatHijriPeriod = (t: { hijriYearStart?: number; hijriYearEnd?: number } | null) => {
  if (!t) return "—";
  const label = formatFmbHijriPeriod(t.hijriYearStart, t.hijriYearEnd);
  return label ?? "—";
};

type ThaliRow = {
  id?: string;
  thaliNo?: string;
  thaliType?: { name?: string };
  isActive?: boolean;
  deliveryAddress?: string;
  deliveryMohallah?: string;
};

const formatThaliLabel = (thali: ThaliRow) => {
  const typeName = thali?.thaliType?.name;
  const base = `${thali.thaliNo}${typeName ? ` (${typeName})` : ""}${thali.isActive ? "" : " · inactive"}`;
  const addr = thali.deliveryAddress || thali.deliveryMohallah;
  return addr
    ? `${base} — ${[thali.deliveryAddress, thali.deliveryMohallah].filter(Boolean).join(", ")}`
    : base;
};

const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
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

const InfoField = ({ label, children }: { label: string; children?: React.ReactNode }) => (
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

  const profile = record.deliveryScheduleProfile as
    | {
        code?: string;
        name?: string;
        deliveryWeekdays?: unknown;
        cutoffOffsetDays?: number | null;
        cutoffMinutes?: number | null;
      }
    | undefined;
  const t = record.fmbTakhmeenCurrent as
    | {
        takhmeenAmount?: unknown;
        pendingBalance?: unknown;
        paidBalance?: unknown;
        hijriYearStart?: number;
        hijriYearEnd?: number;
        startDate?: string;
        createdAt?: string;
      }
    | undefined;
  const its = record.itsdata as
    | {
        Full_Name?: string;
        ITS_ID?: string;
        Jamaat?: string;
        Area?: string;
        Sector_Incharge_Name?: string;
        Address?: string;
      }
    | undefined;
  const thalis = Array.isArray(record.thalis) ? (record.thalis as ThaliRow[]) : [];
  const activeThaliCount = thalis.filter((thali) => thali.isActive).length;
  const hasMultipleThalis = thalis.length > 1;
  const displayName = its?.Full_Name || (record.name as string) || "—";
  let thaliContent: React.ReactNode = "—";
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
        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <InfoSection title="FMB record">
            <InfoField label="File no. (legacy)">{record.fileNo as React.ReactNode}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Delivery schedule">
              {profile ? `${profile.code} — ${profile.name}` : "—"}
            </InfoField>
            {profile &&
            Array.isArray(profile.deliveryWeekdays) &&
            profile.deliveryWeekdays.length > 0 ? (
              <>
                <Divider sx={{ my: 0.75 }} />
                <InfoField label="Delivery weekdays">
                  {formatWeekdays(profile.deliveryWeekdays)}
                </InfoField>
              </>
            ) : null}
            {cutoffHint && (
              <>
                <Divider sx={{ my: 0.75 }} />
                <InfoField label="Schedule cut-off">{cutoffHint}</InfoField>
              </>
            )}
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Record created">
              {formatListDate(record.createdAt as string | number | Date, { empty: "—" })}
            </InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Last updated">
              {formatListDate(record.updatedAt as string | number | Date, { empty: "—" })}
            </InfoField>
          </InfoSection>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <InfoSection title="Thalis & contact">
            <InfoField label={hasMultipleThalis ? "Thalis" : "Thali"}>{thaliContent}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Name">{displayName}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="ITS number">{(record.itsNo as string) || its?.ITS_ID}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Jamaat (ITS)">{its?.Jamaat}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Area (ITS)">{its?.Area}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Masool / sector incharge">{its?.Sector_Incharge_Name}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Address (ITS)">{its?.Address}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Mobile">{record.mobileNo as React.ReactNode}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="WhatsApp">{record.whatsappNo as React.ReactNode}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="PAN">{String(record.pan ?? "—")}</InfoField>
          </InfoSection>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <InfoSection title="Status">
            <InfoField label="Last paid date">
              {formatListDate(record.lastPaidDate as string | number | Date, { empty: "-" })}
            </InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Closed at">
              {formatListDate(record.closedAt as string | number | Date, { empty: "Open" })}
            </InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Remarks">{record.remarks as React.ReactNode}</InfoField>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Transfer to">{record.transferTo as React.ReactNode}</InfoField>
          </InfoSection>
        </Grid>

        <Grid size={12}>
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <InfoField label="Pending balance">{formatMoney(t.pendingBalance)}</InfoField>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <InfoField label="Paid balance">{formatMoney(t.paidBalance)}</InfoField>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <InfoField label="Hijri period">{formatHijriPeriod(t)}</InfoField>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <InfoField label="Period start">
                    {formatListDate(t.startDate as string | number | Date, { empty: "—" })}
                  </InfoField>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <InfoField label="Takhmeen record created">
                    {formatListDate(t.createdAt as string | number | Date, { empty: "—" })}
                  </InfoField>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
