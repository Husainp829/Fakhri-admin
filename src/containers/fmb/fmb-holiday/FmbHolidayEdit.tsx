import React from "react";
import { Edit, type EditProps } from "react-admin";
import { formatIsoDate } from "@/utils/date-format";
import { HolidayForm } from "./common/HolidayForm";

const transform = (data: Record<string, unknown>) => ({
  ...data,
  holidayDate: data.holidayDate
    ? formatIsoDate(data.holidayDate as string | Date)
    : data.holidayDate,
});

export default (props: EditProps) => (
  <Edit {...props} transform={transform} mutationMode="pessimistic">
    <HolidayForm isEdit />
  </Edit>
);
