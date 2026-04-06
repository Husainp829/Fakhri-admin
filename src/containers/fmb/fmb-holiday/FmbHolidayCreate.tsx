import React from "react";
import { Create, type CreateProps } from "react-admin";
import dayjs from "dayjs";
import { HolidayForm } from "./common/HolidayForm";

const transform = (data: Record<string, unknown>) => ({
  ...data,
  holidayDate: data.holidayDate
    ? dayjs(data.holidayDate as string | Date).format("YYYY-MM-DD")
    : data.holidayDate,
});

export default (props: CreateProps) => (
  <Create {...props} transform={transform} redirect="list">
    <HolidayForm isEdit={false} />
  </Create>
);
