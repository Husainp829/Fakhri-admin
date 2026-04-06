import React from "react";
import { Create, type CreateProps } from "react-admin";
import { useSearchParams } from "react-router-dom";
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

export default function FmbThaliSuspensionCreate(props: CreateProps) {
  const [searchParams] = useSearchParams();
  const defaultFmbId = searchParams.get("fmbId") || undefined;
  const defaultFmbThaliId = searchParams.get("fmbThaliId") || undefined;

  return (
    <Create {...props} transform={transform} redirect="list">
      <SuspensionForm
        isEdit={false}
        defaultFmbId={defaultFmbId}
        defaultFmbThaliId={defaultFmbThaliId}
      />
    </Create>
  );
}
