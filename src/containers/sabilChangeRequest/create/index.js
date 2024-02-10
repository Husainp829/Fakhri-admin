import React from "react";
import {
  TextInput,
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  FormDataConsumer,
} from "react-admin";
import Grid from "@mui/material/Grid";
import { ITSInput } from "../common/itsInput";

import TransferWithin from "./transferWithin";
import TransferOut from "./transferOut";

export default (props) => {
  const optionRenderer = (choice) => `${choice.itsNo} - ${choice.sabilType}`;

  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const sabilId = searchParams.get("sabilId");
  const transform = (data) => ({
    sabilId: data.sabilId,
    changeType: data.changeType,
    transferTo: data.transferTo,
    fromITS: data.fromITS,
    toITS: data.toITS,
  });

  const takhmeenDefaultValues = () => ({ sabilId });
  return (
    <Create {...props} transform={transform}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={takhmeenDefaultValues}
      >
        <SelectInput
          source="changeType"
          label="Change Type"
          helperText="Select any one of Close Sabil, Transfer Within Jamaat, Transfer Out"
          choices={[
            { id: "CLOSE", name: "Close Sabil" },
            { id: "TRANSFER_WITHIN_JAMAAT", name: "Transfer Within Jamaat" },
            { id: "TRANSFER_OUT", name: "Transfer Out" },
          ]}
          fullWidth
          isRequired
        />
        <Grid container spacing={1} sx={{ mt: 2 }}>
          <Grid item lg={6} xs={6}>
            <ReferenceInput source="sabilId" reference="sabilData" required>
              <ITSInput
                fullWidth
                label="ITS No."
                optionText={optionRenderer}
                shouldRenderSuggestions={(val) => val.trim().length === 8}
                noOptionsText="Enter valid ITS No."
              />
            </ReferenceInput>
            <TextInput source="sabilNo" fullWidth disabled />
            <TextInput source="pendingBalance" fullWidth disabled />
            <TextInput source="paidBalance" fullWidth disabled />
          </Grid>
          <Grid item lg={6} xs={6}>
            <TextInput source="sabilType" fullWidth disabled />
            <TextInput source="name" label="Sabil Holder Name" fullWidth disabled />
          </Grid>
        </Grid>
        <FormDataConsumer>
          {({ formData }) => {
            const type = formData.changeType;
            if (type === "TRANSFER_WITHIN_JAMAAT") {
              return <TransferWithin />;
            }
            if (type === "TRANSFER_OUT") {
              return <TransferOut />;
            }
            return <></>;
          }}
        </FormDataConsumer>
        <TextInput source="remarks" fullWidth />
      </SimpleForm>
    </Create>
  );
};
