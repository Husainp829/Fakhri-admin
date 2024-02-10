import React, { useEffect } from "react";
import {
  TextInput,
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
  FormDataConsumer,
  RadioButtonGroupInput,
} from "react-admin";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useWatch, useFormContext } from "react-hook-form";

import HofLookup from "../common/hofLookup";
import { CHAIRS_UNIT, ZABIHAT_UNIT } from "../../../constants";

export default () => {
  const { setValue } = useFormContext();
  const takhmeenAmount = useWatch({ name: "takhmeenAmount" });
  const iftaari = useWatch({ name: "iftaari" });
  const chairs = useWatch({ name: "chairs" });
  const zabihat = useWatch({ name: "zabihat" });

  useEffect(() => {
    const calcTotal = () =>
      takhmeenAmount + iftaari + CHAIRS_UNIT * chairs + ZABIHAT_UNIT * zabihat;
    setValue("total", calcTotal(takhmeenAmount, iftaari, chairs, zabihat));
  }, [takhmeenAmount, iftaari, chairs, zabihat]);
  return (
    <Grid container spacing={1} sx={{ mt: 3 }}>
      <Grid item xs={12}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          HOF Details <HofLookup change={() => {}} />
        </Typography>
      </Grid>
      <Grid item lg={6} xs={6}>
        <TextInput source="HOFId" label="HOF ITS" fullWidth isRequired />
      </Grid>
      <Grid item lg={6} xs={6}>
        <TextInput source="HOFName" label="Full Name" fullWidth isRequired />
      </Grid>
      <Grid item lg={12} xs={12}>
        <TextInput source="HOFAddress" label="Address" fullWidth isRequired />
      </Grid>
      <Grid item lg={6} xs={6}>
        <TextInput source="HOFPhone" label="Phone" fullWidth isRequired />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">Family Members</Typography>
        <ArrayInput source="familyMembers" fullWidth label="">
          <SimpleFormIterator inline fullWidth>
            <FormDataConsumer>
              {({ getSource }) => (
                <Grid container spacing={1} sx={{ my: 2 }}>
                  <Grid item lg={12} xs={12} sx={{ mb: 1 }}>
                    <TextInput source={getSource("name")} helperText={false} fullWidth isRequired />
                  </Grid>
                  <Grid item lg={4} xs={3}>
                    <TextInput
                      source={getSource("its")}
                      label="ITS"
                      helperText={false}
                      fullWidth
                      isRequired
                    />
                  </Grid>
                  <Grid item lg={4} xs={3}>
                    <TextInput source={getSource("age")} helperText={false} fullWidth isRequired />
                  </Grid>
                  <Grid item lg={4} xs={3}>
                    <TextInput
                      source={getSource("gender")}
                      helperText={false}
                      fullWidth
                      isRequired
                    />
                  </Grid>
                </Grid>
              )}
            </FormDataConsumer>
          </SimpleFormIterator>
        </ArrayInput>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body1">Takhmeen Details</Typography>
      </Grid>
      <Grid item lg={6} xs={6}>
        <NumberInput source="takhmeenAmount" fullWidth defaultValue={0} />
      </Grid>
      <Grid item lg={6} xs={6}>
        <NumberInput source="zabihat" fullWidth defaultValue={0} />
      </Grid>
      <Grid item lg={6} xs={6}>
        <NumberInput source="iftaari" fullWidth defaultValue={0} />
      </Grid>
      <Grid item lg={6} xs={6}>
        <NumberInput source="chairs" fullWidth defaultValue={0} />
      </Grid>
      <Grid item lg={12} xs={12}>
        <NumberInput label="Total Payable" source="total" fullWidth disabled defaultValue={0} />
      </Grid>

      <Grid item lg={12} xs={12}>
        <NumberInput label="Paid Amount" source="paidAmount" fullWidth defaultValue={0} />
      </Grid>
      <Grid item lg={6} xs={6}>
        <RadioButtonGroupInput
          source="mode"
          choices={[
            { id: "CASH", name: "CASH" },
            { id: "ONLINE", name: "ONLINE" },
            { id: "CHEQUE", name: "CHEQUE" },
          ]}
          fullWidth
        />
      </Grid>
      <Grid item lg={6} xs={6}>
        <TextInput source="details" label="Payment Details" fullWidth />
      </Grid>

      <Grid item lg={12} xs={12}>
        <TextInput source="comments" fullWidth />
      </Grid>
    </Grid>
  );
};
