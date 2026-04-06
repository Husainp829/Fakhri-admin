import React from "react";
import { Edit, type EditProps } from "react-admin";
import dayjs from "dayjs";
import { SuspensionForm } from "./common/SuspensionForm";

const transform = (data: Record<string, unknown>) => ({
  ...data,
  fmbId: undefined,
  startDate: data.startDate
    ? dayjs(data.startDate as string | Date).format("YYYY-MM-DD")
    : data.startDate,
  endDate: data.endDate ? dayjs(data.endDate as string | Date).format("YYYY-MM-DD") : data.endDate,
});

export default (props: EditProps) => (
  <Edit {...props} transform={transform} mutationMode="pessimistic">
    <SuspensionForm isEdit />
  </Edit>
);
