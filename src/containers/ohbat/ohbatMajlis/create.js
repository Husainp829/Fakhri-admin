import React from "react";
import { Create, SimpleForm } from "react-admin";
import { OhbatMajlisFormFields } from "./OhbatMajlisFormFields";

const OhbatMajlisCreate = () => (
  <Create redirect="list" defaultValues={{ startTime: "09:00" }}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 960 }}>
      <OhbatMajlisFormFields />
    </SimpleForm>
  </Create>
);

export default OhbatMajlisCreate;
