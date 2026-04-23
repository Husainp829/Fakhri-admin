import React from "react";
import { Create, type CreateProps } from "react-admin";
import { formatIsoDate } from "@/utils/date-format";
import { HolidayForm } from "./common/HolidayForm";

const transform = (data: Record<string, unknown>) => ({
  ...data,
  holidayDate: data.holidayDate
    ? formatIsoDate(data.holidayDate as string | Date)
    : data.holidayDate,
});

export default (props: CreateProps) => (
  <Create {...props} transform={transform} redirect="list">
    <HolidayForm isEdit={false} />
  </Create>
);
