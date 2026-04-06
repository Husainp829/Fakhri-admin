import type { CreateProps, RaRecord } from "react-admin";
import { TextInput, Create, SimpleForm, ReferenceInput } from "react-admin";
import Grid from "@mui/material/Grid";
import { ITSInput } from "./common/ItsInput";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";

const SabilTakhmeenCreate = (props: CreateProps) => {
  const optionRenderer = (choice: RaRecord) => `${choice.itsNo} - ${choice.sabilType}`;

  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const sabilId = searchParams.get("sabilId");
  const transform = (data: RaRecord) => ({
    sabilId: data.sabilId,
    takhmeenAmount: data.newTakhmeenAmount,
  });

  const takhmeenDefaultValues = () => ({ sabilId });
  return (
    <Create {...props} transform={transform} redirect={`/sabilData/${sabilId}/show`}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={takhmeenDefaultValues}
      >
        <Grid container spacing={1}>
          <Grid
            size={{
              lg: 6,
              xs: 6,
            }}
          >
            <ReferenceInput source="sabilId" reference="sabilData" required>
              <ITSInput
                fullWidth
                label="ITS No."
                optionText={optionRenderer}
                shouldRenderSuggestions={(val: string) => val.trim().length === 8}
                noOptionsText="Enter valid ITS No."
              />
            </ReferenceInput>
            <TextInput source="sabilNo" fullWidth disabled />
            <TextInput
              source="previousTakhmeenAmount"
              fullWidth
              disabled
              label="Previous Takhmeen Amount"
            />
          </Grid>
          <Grid
            size={{
              lg: 6,
              xs: 6,
            }}
          >
            <TextInput source="sabilType" fullWidth disabled />
            <TextInput source="name" label="Sabil Holder Name" fullWidth disabled />
            <NoArrowKeyNumberInput
              source="newTakhmeenAmount"
              fullWidth
              label="New Takhmeen Amount"
            />
          </Grid>
        </Grid>
        <TextInput source="remarks" fullWidth />
      </SimpleForm>
    </Create>
  );
};

export default SabilTakhmeenCreate;
