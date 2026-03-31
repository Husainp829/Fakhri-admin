import React from "react";
import {
  Datagrid,
  FunctionField,
  List,
  TextField,
  Title,
  SimpleList,
  useCreatePath,
} from "react-admin";
import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { fromGregorian } from "../../../utils/hijriDateUtils";

const formatSlotLabel = (slot) =>
  slot ? `${slot.charAt(0).toUpperCase()}${slot.slice(1)}` : "—";

const formatMajlisDateUtc = (date) =>
  date ? dayjs.utc(date).format("DD - MMM - YYYY") : "—";

const formatMajlisDayOfWeekUtc = (date) => (date ? dayjs.utc(date).format("dddd") : "—");

const formatMajlisHijriUtc = (date) =>
  date ? fromGregorian(dayjs.utc(date).toDate(), "code") : "—";

const OhbatMajlisUpcomingList = () => {
  const isSmall = useMediaQuery((t) => t.breakpoints.down("sm"), { noSsr: true });
  const createPath = useCreatePath();
  const attendanceBase = createPath({ resource: "ohbatMajlisAttendance", type: "create" });

  const toAttendance = (majlisId) =>
    `${attendanceBase}?ohbatMajalisId=${encodeURIComponent(majlisId)}`;

  return (
    <>
      <Title title="Upcoming ohbat majlis" />
      <List resource="ohbatMajlisUpcoming" pagination={false} perPage={500}>
        {isSmall ? (
          <SimpleList
            primaryText={(r) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>
                    {r.hostName || r.hostItsNo || "—"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {r.sadarat?.name || "—"}
                    {r.hostSector || r.hostSubSector
                      ? ` · ${[r.hostSector, r.hostSubSector].filter(Boolean).join(" · ")}`
                      : ""}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ whiteSpace: "nowrap" }}
                  component={Link}
                  to={toAttendance(r.id)}
                >
                  Record
                </Button>
              </Box>
            )}
            secondaryText={(r) =>
              `${r.type || "—"} · ${formatMajlisDateUtc(r.date)} · ${formatSlotLabel(r.slot)} · ${formatMajlisDayOfWeekUtc(
                r.date,
              )} · ${formatMajlisHijriUtc(r.date)}`
            }
            rowSx={() => ({ borderBottom: "1px solid #e0e0e0" })}
          />
        ) : (
          <Datagrid bulkActionButtons={false}>
            <TextField source="type" />
            <TextField source="slot" />
            <FunctionField label="Date (UTC)" render={(r) => formatMajlisDateUtc(r.date)} />
            <FunctionField label="Day" render={(r) => formatMajlisDayOfWeekUtc(r.date)} />
            <FunctionField label="Hijri" render={(r) => formatMajlisHijriUtc(r.date)} />
            <FunctionField label="Sadarat" render={(r) => r.sadarat?.name || "—"} />
            <TextField source="hostItsNo" label="Host ITS" />
            <TextField source="hostName" label="Host name" emptyText="—" />
            <TextField source="hostSector" label="Sector" emptyText="—" />
            <TextField source="hostSubSector" label="Sub-sector" emptyText="—" />
            <FunctionField
              label=""
              render={(r) => (
                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  to={toAttendance(r.id)}
                >
                  Record attendance
                </Button>
              )}
            />
          </Datagrid>
        )}
      </List>
    </>
  );
};

export default OhbatMajlisUpcomingList;
