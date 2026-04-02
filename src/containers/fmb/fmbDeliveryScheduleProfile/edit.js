import React from "react";
import { Edit } from "react-admin";
import { ProfileForm } from "./common/profileForm";

const transform = (data) => ({
  ...data,
  deliveryWeekdays: Array.isArray(data.deliveryWeekdays)
    ? data.deliveryWeekdays.map((n) => parseInt(n, 10)).filter((n) => !Number.isNaN(n))
    : [],
  cutoffOffsetDays: data.cutoffOffsetDays === "" ? null : data.cutoffOffsetDays,
  cutoffMinutes: data.cutoffMinutes === "" ? null : data.cutoffMinutes,
});

export default (props) => (
  <Edit {...props} transform={transform} mutationMode="pessimistic">
    <ProfileForm />
  </Edit>
);
