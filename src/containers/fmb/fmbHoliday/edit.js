import React from "react";
import { Edit } from "react-admin";
import dayjs from "dayjs";
import { HolidayForm } from "./common/holidayForm";

const transform = (data) => ({
  ...data,
  holidayDate: data.holidayDate ? dayjs(data.holidayDate).format("YYYY-MM-DD") : data.holidayDate,
});

export default (props) => (
  <Edit {...props} transform={transform} mutationMode="pessimistic">
    <HolidayForm isEdit />
  </Edit>
);
