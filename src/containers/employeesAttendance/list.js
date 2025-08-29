/* eslint-disable no-console */
import React, { useState, useEffect } from "react";
import { Title } from "react-admin";
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
} from "@mui/material";
import dayjs from "dayjs";
import { EMPLOYEE_TYPE } from "../../constants";
import { callApi } from "../../dataprovider/miscApis";

const EmployeeAttendanceList = () => {
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [type, setType] = useState(EMPLOYEE_TYPE.ROTI);
  const [attendance, setAttendance] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);

  useEffect(() => {
    const days = [];
    const start = dayjs(`${month}-01`);
    const end = start.daysInMonth();
    for (let d = 1; d <= end; d += 1) {
      days.push(d);
    }
    setDaysInMonth(days);
  }, [month]);

  useEffect(() => {
    if (type && month) {
      fetchData();
    }
  }, [month, type]);

  const fetchData = async () => {
    try {
      const { data: response } = await callApi("employeesAttendance", { month, type }, "GET");
      setAttendance(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
      return Promise.reject(err); // React-Admin expects a rejected promise on error
    }
  };

  const getCellContent = (emp, d) => {
    const dayData = emp.days[d];
    if (!dayData) return "X";

    let cellContent;
    if (type === EMPLOYEE_TYPE.ROTI) {
      if (dayData.checkIn) {
        cellContent = dayjs(dayData.checkIn).format("HH:mm");
      } else {
        cellContent = "-";
      }
    } else {
      const checkIn = dayData.checkIn ? dayjs(dayData.checkIn).format("HH:mm") : "-";
      const checkOut = dayData.checkOut ? dayjs(dayData.checkOut).format("HH:mm") : "-";
      cellContent = `${checkIn} - ${checkOut}`;
    }
    return cellContent;
  };

  return (
    <Box p={2}>
      <Title title="Employee Attendance" />
      <Box mb={2} display="flex" gap={2}>
        <TextField
          label="Month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          size="small"
          sx={{ width: "15rem" }}
        />
        <FormControl size="small">
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            value={type}
            onChange={(e) => setType(e.target.value)}
            label="Type"
            sx={{ width: "15rem" }}
          >
            {Object.entries(EMPLOYEE_TYPE).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Table
        size="small"
        sx={{
          borderCollapse: "collapse", // ensures cell borders touch each other
          "& th, & td": {
            border: "1px solid #ccc", // border for every cell
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Employee</TableCell>
            {daysInMonth.map((d) => {
              const date = dayjs(`${month}-${String(d).padStart(2, "0")}`);
              const dayLabel = date.format("ddd"); // 3-letter day
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

export default EmployeeAttendanceList;
