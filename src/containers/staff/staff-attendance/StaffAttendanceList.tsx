/* eslint-disable no-console */
import { useState, useEffect } from "react";
import { Title } from "react-admin";
import Icon from "@mui/icons-material/RefreshRounded";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import dayjs from "dayjs";

import { EMPLOYEE_TYPE } from "@/constants";
import { callApi } from "@/dataprovider/misc-apis";

type DayCell = string | { checkIn?: string; checkOut?: string };

type AttendanceEmployee = {
  employeeId: string | number;
  name: string;
  days: Record<number, DayCell>;
};

const StaffAttendanceList = () => {
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [type, setType] = useState<string>("FM_STAFF");
  const [attendance, setAttendance] = useState<AttendanceEmployee[]>([]);
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

  useEffect(() => {
    const days: number[] = [];
    const start = dayjs(`${month}-01`);
    const end = start.daysInMonth();
    for (let d = 1; d <= end; d += 1) {
      days.push(d);
    }
    setDaysInMonth(days);
  }, [month]);

  const fetchData = async () => {
    try {
      const { data: response } = await callApi({
        location: "employeesAttendance",
        data: { month, type },
        method: "GET",
      });
      setAttendance((response as { data?: AttendanceEmployee[] })?.data ?? []);
      return (response as { data?: AttendanceEmployee[] })?.data;
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  };

  useEffect(() => {
    if (type && month) {
      void fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mirror legacy: fetch on month/type only
  }, [month, type]);

  const getCellContent = (emp: AttendanceEmployee, d: number) => {
    const dayData = emp.days[d];
    if (!dayData) return "X";

    if (typeof dayData === "string") {
      return dayjs.utc(dayData).format("HH:mm");
    }

    const checkIn = dayData.checkIn ? dayjs.utc(dayData.checkIn).format("HH:mm") : "-";
    const checkOut = dayData.checkOut ? dayjs.utc(dayData.checkOut).format("HH:mm") : "-";
    let cellContent;
    if (checkIn === checkOut) {
      cellContent = `${checkIn} - X`;
    } else {
      cellContent = `${checkIn} - ${checkOut}`;
    }

    return cellContent;
  };

  return (
    <Box p={2}>
      <Title title="Staff Attendance" />
      <Box mb={2} display="flex" gap={2}>
        <TextField
          label="Month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          size="small"
          sx={{ width: "15rem !important" }}
        />
        <FormControl size="small" sx={{ width: "15rem !important" }}>
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            value={type}
            onChange={(e) => setType(e.target.value)}
            label="Type"
          >
            {Object.entries(EMPLOYEE_TYPE).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => void fetchData()}
          aria-label="Refresh"
          sx={{ display: "flex", alignSelf: "center" }}
        >
          <Icon />
        </IconButton>
      </Box>

      <Table
        size="small"
        sx={{
          borderCollapse: "collapse",
          "& th, & td": {
            border: 1,
            borderColor: "divider",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Name</TableCell>
            {daysInMonth.map((d) => {
              const date = dayjs(`${month}-${String(d).padStart(2, "0")}`);
              const dayLabel = date.format("ddd");
              return (
                <TableCell key={d} sx={{ textAlign: "center", minWidth: 40 }}>
                  {dayLabel} <br /> {d}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {attendance.length > 0 ? (
            attendance.map((emp) => (
              <TableRow key={emp.employeeId}>
                <TableCell>{emp.employeeId}</TableCell>
                <TableCell>{emp.name}</TableCell>
                {daysInMonth.map((d) => {
                  const cellContent = getCellContent(emp, d);
                  return (
                    <TableCell key={d} align="center">
                      {cellContent}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={daysInMonth.length + 2} align="center">
                No attendance data found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default StaffAttendanceList;
