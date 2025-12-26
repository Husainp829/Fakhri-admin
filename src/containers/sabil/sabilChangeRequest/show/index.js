import React, { useState, useEffect } from "react";
import { useShowContext, Show, TopToolbar, Confirm, useNotify, useRefresh } from "react-admin";
import Button from "@mui/material/Button";
import { Grid, Paper, Typography, Box, Divider, Chip } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { callApi } from "../../../../dataprovider/miscApis";
import { getColor } from "../utils";

const SabilActions = () => {
  const {
    record, // record fetched via dataProvider.getOne() based on the id from the location
  } = useShowContext();
  const [approveOpen, setApproveOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  return (
    <TopToolbar>
      {record?.status === "PENDING" && (
        <>
          <Button onClick={() => setApproveOpen(true)} color="success" startIcon={<DoneIcon />}>
            Approve
          </Button>
          <Button onClick={() => setDeclineOpen(true)} color="error" startIcon={<CloseIcon />}>
            Decline
          </Button>

          <Confirm
            isOpen={approveOpen}
            title="Approve Change Request"
            content="Are you sure you want to approve this request?"
            onConfirm={() =>
              callApi({
                location: "sabilChangeRequests/approve",
                method: "PUT",
                id: record.id,
              })
                .then(() => {
                  notify("Approved");
                  refresh();
                })
                .catch((err) => {
                  notify(err.message, { type: "warning" });
                })
                .finally(() => {
                  setApproveOpen(false);
                })
            }
            onClose={() => {
              setApproveOpen(false);
            }}
          />
          <Confirm
            isOpen={declineOpen}
            title="Decline Change Request"
            content="Are you sure you want to decline this request?"
            onConfirm={() =>
              callApi({ location: "sabilChangeRequests/decline", method: "PUT", id: record.id })
                .then(() => {
                  notify("Declined");
                  refresh();
                })
                .catch((err) => {
                  notify(err.message, { type: "warning" });
                })
                .finally(() => {
                  setDeclineOpen(false);
                })
            }
            onClose={() => {
              setDeclineOpen(false);
            }}
          />
        </>
      )}
    </TopToolbar>
  );
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

const InfoField = ({ source, label, record }) => {
  const value = source.split(".").reduce((obj, key) => obj?.[key], record);

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
      >
        {label || source}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25 }}>
        {value || "-"}
      </Typography>
    </Box>
  );
};

const BalanceSummary = ({ sabilId }) => {
  const [balanceSummary, setBalanceSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!sabilId) return;

    setIsLoading(true);
    callApi({
      location: "sabilLedger",
      method: "GET",
      id: `${sabilId}/balance-summary`,
    })
      .then((response) => {
        if (response?.data?.rows?.[0]) {
          setBalanceSummary(response.data.rows[0]);
        } else if (response?.data) {
          setBalanceSummary(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching balance summary:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [sabilId]);

  if (isLoading || !balanceSummary) {
    return null;
  }

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <Box sx={{ mt: 1 }}>
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: "text.secondary" }}>
        Balance Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item size={{ xs: 6, md: 6 }}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            >
              Pending Balance
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mt: 0.5,
                fontWeight: 700,
                color: "error.main",
              }}
            >
              ₹{(balanceSummary.pendingBalance || 0).toLocaleString("en-IN")}
            </Typography>
          </Box>
        </Grid>
        <Grid item size={{ xs: 6, md: 6 }}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            >
              Last Paid Month
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 500 }}>
              {balanceSummary.lastPaidMonth
                ? `${
                    monthNames[balanceSummary.lastPaidMonth.month - 1] ||
                    balanceSummary.lastPaidMonth.month
                  }/${balanceSummary.lastPaidMonth.year}`
                : "N/A"}
            </Typography>
          </Box>
        </Grid>
        {balanceSummary.writtenOffAmount > 0 && (
          <Grid item size={{ xs: 6, md: 6 }}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              >
                Written Off Amount
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mt: 0.5,
                  fontWeight: 700,
                  color: "warning.main",
                }}
              >
                ₹{(balanceSummary.writtenOffAmount || 0).toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

const CloseRequestShow = () => {
  const { record } = useShowContext();

  if (!record) return null;

  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={2}>
        {/* Section 1: Request Information */}
        <Grid item size={{ xs: 12, md: 4 }}>
          <InfoSection title="Request Information">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              >
                Status
              </Typography>
              <Chip
                label={record.status}
                color={getColor(record.status)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Divider sx={{ my: 0.75 }} />
            <InfoField label="Change Type" source="changeType" record={record} />
            {record?.remarks && (
              <>
                <Divider sx={{ my: 0.75 }} />
                <InfoField label="Remarks" source="remarks" record={record} />
              </>
            )}
          </InfoSection>
        </Grid>

        {/* Section 2: Transfer Details (if applicable) */}
        {(record?.changeType === "TRANSFER_WITHIN_JAMAAT" ||
          record?.changeType === "TRANSFER_OUT") && (
          <Grid item size={{ xs: 6 }}>
            <InfoSection title="Transfer Details">
              {record?.changeType === "TRANSFER_WITHIN_JAMAAT" && (
                <Grid container spacing={2}>
                  <Grid item size={{ xs: 12, md: 12 }}>
                    <InfoField label="From ITS" source="fromITS" record={record} />
                  </Grid>
                  <Grid item size={{ xs: 12, md: 12 }}>
                    <InfoField label="To ITS" source="toITS" record={record} />
                  </Grid>
                </Grid>
              )}
              {record?.changeType === "TRANSFER_OUT" && (
                <InfoField label="Transfer To" source="transferTo" record={record} />
              )}
            </InfoSection>
          </Grid>
        )}

        {/* Section 3: Sabil Information */}
        <Grid item size={{ xs: 12, md: 8 }}>
          <InfoSection title="Sabil Information">
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <InfoField label="Sabil Number" source="sabilData.sabilNo" record={record} />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <InfoField label="Sabil Type" source="sabilData.sabilType" record={record} />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <InfoField label="Name" source="sabilData.itsdata.Full_Name" record={record} />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <InfoField label="ITS Number" source="sabilData.itsdata.ITS_ID" record={record} />
              </Grid>
              <Grid item size={{ xs: 12, md: 12 }}>
                <InfoField label="Address" source="sabilData.itsdata.Address" record={record} />
              </Grid>
            </Grid>
            {record?.sabilData?.id && <BalanceSummary sabilId={record.sabilData.id} />}
          </InfoSection>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ({ props }) => (
  <Show actions={<SabilActions {...props} />}>
    <CloseRequestShow />
  </Show>
);
