import React from "react";
import { Edit } from "react-admin";
import dayjs from "dayjs";
import { SuspensionForm } from "./common/suspensionForm";

const transform = (data) => ({
  ...data,
  fmbId: undefined,
  startDate: data.startDate ? dayjs(data.startDate).format("YYYY-MM-DD") : data.startDate,
  endDate: data.endDate ? dayjs(data.endDate).format("YYYY-MM-DD") : data.endDate,
});

export default (props) => (
  <Edit {...props} transform={transform} mutationMode="pessimistic">
    <SuspensionForm isEdit />
  </Edit>
);
