import { Create, SimpleForm } from "react-admin";
import { OhbatMajlisFormFields } from "./OhbatMajlisFormFields";

const OhbatMajlisCreate = () => (
  <Create redirect="list">
    <SimpleForm
      warnWhenUnsavedChanges
      sx={{ maxWidth: 960 }}
      defaultValues={{ startTime: "09:00" }}
    >
      <OhbatMajlisFormFields />
    </SimpleForm>
  </Create>
);

export default OhbatMajlisCreate;
