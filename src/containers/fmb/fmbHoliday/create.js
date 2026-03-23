import React from "react";
import { Create } from "react-admin";
import dayjs from "dayjs";
import { HolidayForm } from "./common/holidayForm";

const transform = (data) => ({
  ...data,
  holidayDate: data.holidayDate ? dayjs(data.holidayDate).format("YYYY-MM-DD") : data.holidayDate,
});

export default (props) => (
  <Create {...props} transform={transform} redirect="list">
    <HolidayForm isEdit={false} />
  </Create>
);
