import React from "react";
import { Edit, type EditProps } from "react-admin";
import dayjs from "dayjs";
import { HolidayForm } from "./common/HolidayForm";

const transform = (data: Record<string, unknown>) => ({
  ...data,
  holidayDate: data.holidayDate
    ? dayjs(data.holidayDate as string | Date).format("YYYY-MM-DD")
    : data.holidayDate,
});

export default (props: EditProps) => (
  <Edit {...props} transform={transform} mutationMode="pessimistic">
    <HolidayForm isEdit />
  </Edit>
);
