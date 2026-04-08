import { useState } from "react";
import {
  Datagrid,
  FunctionField,
  List,
  TextField,
  Title,
  SimpleList,
  useCreatePath,
} from "react-admin";
import type { RaRecord } from "react-admin";
import { Box, Button, Tab, Tabs, Typography, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { fromGregorian } from "@/utils/hijri-date-utils";
import { formatMajlisStartTimeLabel } from "../ohbat-majlis/OhbatMajlisTime";

const formatMajlisDateUtc = (date: unknown) =>
  date ? dayjs.utc(String(date)).format("DD - MMM - YYYY") : "—";

const formatMajlisDayOfWeekUtc = (date: unknown) =>
  date ? dayjs.utc(String(date)).format("dddd") : "—";

const formatMajlisHijriUtc = (date: unknown) =>
  date ? fromGregorian(dayjs.utc(String(date)).toDate(), "code") : "—";

export default function OhbatMajlisUpcomingList() {
  const [attendanceTab, setAttendanceTab] = useState<"upcoming" | "past">("upcoming");
  const isNarrow = useMediaQuery((t) => t.breakpoints.down("md"), { noSsr: true });
  const createPath = useCreatePath();
  const attendanceBase = createPath({ resource: "ohbatMajlisAttendance", type: "create" });

  const toAttendance = (majlisId: string | number) =>
    `${attendanceBase}?ohbatMajalisId=${encodeURIComponent(String(majlisId))}`;

  const listRowSx = () => ({ borderBottom: 1, borderBottomColor: "divider" });

  const isPast = attendanceTab === "past";
  const title = isPast ? "Past ohbat majlis" : "Upcoming ohbat majlis";

  /** Full path + query; works as react-admin rowClick when passed through createPath default branch. */
  const attendancePathForRecord = (record: RaRecord) => toAttendance(record.id);

  return (
    <>
      <Title title={title} />
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, bgcolor: "background.paper" }}>
        <Tabs
          value={attendanceTab}
          onChange={(_, v) => setAttendanceTab(v)}
          aria-label="Ohbat majlis by date"
        >
          <Tab label="Upcoming" value="upcoming" />
          <Tab label="Past" value="past" />
        </Tabs>
      </Box>
      <List
        resource="ohbatMajlisUpcoming"
        pagination={false}
        perPage={500}
        queryOptions={{ meta: { attendanceScope: attendanceTab } }}
      >
        {isNarrow ? (
          <SimpleList
            rowClick={isPast ? (_id, _resource, record) => attendancePathForRecord(record) : false}
            primaryText={(r: RaRecord) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1,
                  width: "100%",
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ minWidth: 0, flex: "1 1 200px" }}>
                  <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>
                    {(r.hostName as string) || (r.hostItsNo as string) || "—"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {formatMajlisDateUtc(r.date)} · {(r.type as string) || "—"} ·{" "}
                    {formatMajlisStartTimeLabel(r.startTime as string)}
                  </Typography>
                </Box>
                {!isPast && (
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ flexShrink: 0, whiteSpace: "nowrap", alignSelf: "flex-start" }}
                    component={Link}
                    to={toAttendance(r.id)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Record
                  </Button>
                )}
              </Box>
            )}
            secondaryText={(r: RaRecord) =>
              [
                (r.sadarat as { name?: string } | undefined)?.name
                  ? `Sadarat: ${(r.sadarat as { name: string }).name}`
                  : null,
                (r.khidmatguzar as { Full_Name?: string } | undefined)?.Full_Name ||
                r.khidmatguzarItsNo
                  ? `Khidmat: ${(r.khidmatguzar as { Full_Name?: string })?.Full_Name || String(r.khidmatguzarItsNo)}`
                  : null,
                (r.zakereen as { Full_Name?: string } | undefined)?.Full_Name || r.zakereenItsNo
                  ? `Zakereen: ${(r.zakereen as { Full_Name?: string })?.Full_Name || String(r.zakereenItsNo)}`
                  : null,
                r.mobileNo ? `Contact: ${String(r.mobileNo)}` : null,
                [r.hostSector, r.hostSubSector].filter(Boolean).join(" · ") || null,
                r.date ? `Day: ${formatMajlisDayOfWeekUtc(r.date)}` : null,
                r.date ? `Hijri: ${formatMajlisHijriUtc(r.date)}` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "—"
            }
            rowSx={listRowSx}
          />
        ) : (
          <Box sx={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <Datagrid
              bulkActionButtons={false}
              rowClick={
                isPast ? (_id, _resource, record) => attendancePathForRecord(record) : false
              }
              sx={{ minWidth: isPast ? 920 : 1040 }}
            >
              <TextField source="type" />
              <FunctionField
                label="Time"
                render={(r) => formatMajlisStartTimeLabel(r.startTime as string)}
              />
              <FunctionField label="Date (UTC)" render={(r) => formatMajlisDateUtc(r.date)} />
              <FunctionField label="Day" render={(r) => formatMajlisDayOfWeekUtc(r.date)} />
              <FunctionField label="Hijri" render={(r) => formatMajlisHijriUtc(r.date)} />
              <FunctionField
                label="Sadarat"
                render={(r) => (r.sadarat as { name?: string })?.name || "—"}
              />
              <TextField source="hostItsNo" label="Host ITS" />
              <TextField source="hostName" label="Host name" emptyText="—" />
              <TextField source="hostSector" label="Sector" emptyText="—" />
              <TextField source="hostSubSector" label="Sub-sector" emptyText="—" />
              {!isPast && (
                <FunctionField
                  label=""
                  render={(r) => (
                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      to={toAttendance(r.id)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Record attendance
                    </Button>
                  )}
                />
              )}
            </Datagrid>
          </Box>
        )}
      </List>
    </>
  );
}
