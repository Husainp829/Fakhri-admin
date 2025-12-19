import React from "react";
import { Create, SimpleForm, SelectInput, FormDataConsumer } from "react-admin";
import ChulaSabilCreate from "./chulaSabil";
import EstablishmentCreate from "./establishment";
import { getType } from "../../../../constants";

export default (props) => (
  <Create {...props}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <SelectInput
        source="sabilType"
        label="Sabil Type"
        helperText="Select any one of Chula, Establisment, Professional, Muttavatteen"
        choices={[
          { id: "CHULA", name: "CHULA" },
          { id: "ESTABLISHMENT", name: "ESTABLISHMENT" },
          { id: "PROFESSIONAL", name: "PROFESSIONAL" },
          { id: "MUTTAVATTEEN", name: "MUTTAVATTEEN" },
        ]}
        fullWidth
        isRequired
      />
      <FormDataConsumer>
        {({ formData }) => {
          const type = getType(formData.sabilType);
          if (type === "CHULA") {
            return <ChulaSabilCreate />;
          }
          if (type === "ESTABLISHMENT") {
            return <EstablishmentCreate />;
          }
          return <></>;
        }}
      </FormDataConsumer>
    </SimpleForm>
  </Create>
);
