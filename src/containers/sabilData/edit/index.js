import React from "react";
import { Edit, SimpleForm, SelectInput, FormDataConsumer } from "react-admin";
import ChulaSabilCreate from "./chulaSabil";
import EstablishmentCreate from "./establishment";
import { getType } from "../../../constants";

export default (props) => {
  const transform = (data) => {
    const type = getType(data.sabilType);
    if (type === "CHULA") {
      return {
        id: data.id,
        remarks: data.remarks,
        pan: data.pan,
      };
    }
    return {
      id: data.id,
      firmName: data.firmName,
      address: data.address,
      pan: data.pan,
    };
  };
  return (
    <Edit {...props} transform={transform}>
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
          disabled
          fullWidth
          isRequired
        />
        <FormDataConsumer>
          {({ formData }) => {
            if (formData.sabilType === "CHULA" || formData.sabilType === "MUTTAVATTEEN") {
              return <ChulaSabilCreate />;
            }
            if (formData.sabilType === "ESTABLISHMENT" || formData.sabilType === "PROFESSIONAL") {
              return <EstablishmentCreate />;
            }
            return <></>;
          }}
        </FormDataConsumer>
      </SimpleForm>
    </Edit>
  );
};
