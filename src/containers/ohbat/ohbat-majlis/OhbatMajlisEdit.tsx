import { Edit, SimpleForm } from "react-admin";
import { OhbatMajlisFormFields } from "./OhbatMajlisFormFields";

/** Drop server-managed / legacy fields from PUT body. */
const stripReadOnlyFields = (data: Record<string, unknown>) => {
  if (!data || typeof data !== "object") return data;
  const rest = { ...data };
  delete rest.itsNo;
  delete rest.hostName;
  return rest;
};

const OhbatMajlisEdit = () => (
  <Edit redirect="show" transform={stripReadOnlyFields}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 960 }}>
      <OhbatMajlisFormFields />
    </SimpleForm>
  </Edit>
);

export default OhbatMajlisEdit;
