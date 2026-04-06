import type { CreateProps } from "react-admin";
import { Create, SimpleForm, SelectInput, FormDataConsumer } from "react-admin";
import ChulaSabilFields from "./ChulaSabilFields";
import EstablishmentFields from "./EstablishmentFields";
import { getType } from "@/constants";

const SabilDataCreate = (props: CreateProps) => (
  <Create {...props}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <SelectInput
        source="sabilType"
        label="Sabil Type"
        helperText="Select any one of Chula, Establisment, Professional, Muttavatteen"
        choices={[
          { id: "CHULA", name: "CHULA" },
          { id: "ESTABLISHMENT", name: "ESTABLISHMENT" },
          { id: "MUTTAVATTEEN", name: "MUTTAVATTEEN" },
        ]}
        fullWidth
        isRequired
      />
      <FormDataConsumer>
        {({ formData }) => {
          const type = getType(formData.sabilType as string);
          if (type === "CHULA") {
            return <ChulaSabilFields />;
          }
          if (type === "ESTABLISHMENT") {
            return <EstablishmentFields />;
          }
          return null;
        }}
      </FormDataConsumer>
    </SimpleForm>
  </Create>
);

export default SabilDataCreate;
