import type { EditProps, RaRecord } from "react-admin";
import { Edit, SimpleForm, SelectInput, FormDataConsumer } from "react-admin";
import ChulaSabilEditFields from "./ChulaSabilFields";
import EstablishmentEditFields from "./EstablishmentFields";
import { getType } from "@/constants";

const SabilDataEdit = (props: EditProps) => {
  const transform = (data: RaRecord) => {
    const type = getType(data.sabilType as string);
    if (type === "CHULA") {
      return {
        id: data.id,
        itsNo: data.itsNo,
        name: data.name,
        address: data.address,
        pan: data.pan,
        remarks: data.remarks,
      };
    }
    return {
      id: data.id,
      itsNo: data.itsNo,
      name: data.name,
      address: data.address,
      firmName: data.firmName,
      firmAddress: data.firmAddress,
      pan: data.pan,
      remarks: data.remarks,
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
              return <ChulaSabilEditFields />;
            }
            if (formData.sabilType === "ESTABLISHMENT" || formData.sabilType === "PROFESSIONAL") {
              return <EstablishmentEditFields />;
            }
            return null;
          }}
        </FormDataConsumer>
      </SimpleForm>
    </Edit>
  );
};

export default SabilDataEdit;
