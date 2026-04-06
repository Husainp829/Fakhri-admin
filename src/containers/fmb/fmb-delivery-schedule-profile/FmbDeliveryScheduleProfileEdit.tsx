import React from "react";
import { Edit, type EditProps } from "react-admin";
import { ProfileForm } from "./common/ProfileForm";

const transform = (data: Record<string, unknown>) => ({
  ...data,
  deliveryWeekdays: Array.isArray(data.deliveryWeekdays)
    ? data.deliveryWeekdays
        .map((n: unknown) => parseInt(String(n), 10))
        .filter((n) => !Number.isNaN(n))
    : [],
  cutoffOffsetDays: data.cutoffOffsetDays === "" ? null : data.cutoffOffsetDays,
  cutoffMinutes: data.cutoffMinutes === "" ? null : data.cutoffMinutes,
});

export default (props: EditProps) => (
  <Edit {...props} transform={transform} mutationMode="pessimistic">
    <ProfileForm />
  </Edit>
);
