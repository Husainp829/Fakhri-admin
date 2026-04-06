import React from "react";
import { Create, Toolbar, SaveButton, type CreateProps } from "react-admin";
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

const CreateToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);

export default (props: CreateProps) => (
  <Create {...props} transform={transform} redirect="list">
    <ProfileForm toolbar={<CreateToolbar />} />
  </Create>
);
