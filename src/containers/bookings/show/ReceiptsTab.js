import React from "react";
import {
  useRecordContext,
  ReferenceManyField,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  ReferenceField,
  FunctionField,
  Button,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";

const ReceiptsTab = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <ReferenceManyField
      reference="contRcpt"
      target="bookingId"
      record={record}
      sort={{ field: "date", order: "DESC" }}
      perPage={25}
    >
      <Datagrid rowClick={false}>
        <TextField source="type" />
        <TextField source="receiptNo" label="Receipt No" />
        <TextField source="organiser" />
        <DateField source="date" />
        <NumberField source="amount" />
        <TextField source="mode" />
        <ReferenceField source="createdBy" reference="admins" link={false}>
          <TextField source="name" />
        </ReferenceField>
        <TextField source="ref" />
        <TextField source="organiserIts" label="Organiser ITS" />
        <FunctionField
          label="Download"
          source="formNo"
          render={(r) => (
            <Button
              onClick={() => {
                window.open(`#/${r.type === "RENT" ? "cont-rcpt" : "dep-rcpt"}/${r.id}`, "_blank");
              }}
            >
              <DownloadIcon />
            </Button>
          )}
          key="name"
        />
      </Datagrid>
    </ReferenceManyField>
  );
};

export default ReceiptsTab;
