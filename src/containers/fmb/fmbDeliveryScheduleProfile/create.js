import React from "react";
import { Create, Toolbar, SaveButton } from "react-admin";
import { ProfileForm } from "./common/profileForm";

const transform = (data) => ({
  ...data,
  deliveryWeekdays: Array.isArray(data.deliveryWeekdays)
    ? data.deliveryWeekdays.map((n) => parseInt(n, 10)).filter((n) => !Number.isNaN(n))
    : [],
  cutoffOffsetDays: data.cutoffOffsetDays === "" ? null : data.cutoffOffsetDays,
  cutoffMinutes: data.cutoffMinutes === "" ? null : data.cutoffMinutes,
});

const CreateToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);

export default (props) => (
  <Create {...props} transform={transform} redirect="list">
    <ProfileForm toolbar={<CreateToolbar />} />
  </Create>
);
