import React from "react";
import { Create } from "react-admin";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { SuspensionForm } from "./common/suspensionForm";

const transform = (data) => ({
  ...data,
  startDate: data.startDate ? dayjs(data.startDate).format("YYYY-MM-DD") : data.startDate,
  endDate: data.endDate ? dayjs(data.endDate).format("YYYY-MM-DD") : data.endDate,
});

export default function FmbThaliSuspensionCreate(props) {
  const [searchParams] = useSearchParams();
  const defaultFmbId = searchParams.get("fmbId") || undefined;

  return (
    <Create {...props} transform={transform} redirect="list">
      <SuspensionForm isEdit={false} defaultFmbId={defaultFmbId} />
    </Create>
  );
}
