import React from "react";
import { Create, type CreateProps } from "react-admin";

import { FmbDailyMenuForm, transformFmbDailyMenuPayload } from "./FmbDailyMenuForm";

export default function FmbDailyMenuCreate(props: CreateProps) {
  return (
    <Create {...props} redirect="list" transform={transformFmbDailyMenuPayload}>
      <FmbDailyMenuForm defaultValues={{ menuLines: [] }} />
    </Create>
  );
}
