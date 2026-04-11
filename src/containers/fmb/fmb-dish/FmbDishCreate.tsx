import React from "react";
import { Create, type CreateProps } from "react-admin";

import { FmbDishForm, transformFmbDishPayload } from "./FmbDishForm";

export default function FmbDishCreate(props: CreateProps) {
  return (
    <Create {...props} redirect="list" transform={transformFmbDishPayload}>
      <FmbDishForm defaultValues={{ sortOrder: 0 }} />
    </Create>
  );
}
