import React, { useEffect } from "react";
import {
  TextInput,
  ArrayInput,
  SimpleFormIterator,
  FormDataConsumer,
  RadioButtonGroupInput,
  ArrayField,
  SelectInput,
  BooleanInput,
  useStore,
} from "react-admin";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useWatch, useFormContext } from "react-hook-form";

import HofLookup from "../common/hofLookup";
import NiyaazDataGrid from "../common/niyaazDataGrid";
import BookedSlotsInput from "../common/BookedSlotsInput";
import { calcTotalPayable } from "../../../../utils";
import { MARKAZ_LIST } from "../../../../constants";
import NoArrowKeyNumberInput from "../../../../components/NoArrowKeyNumberInput";

export default () => {
  const { setValue } = useFormContext();
  const [currentEvent] = useStore("currentEvent");
  const takhmeenAmount = useWatch({ name: "takhmeenAmount" });
  const iftaari = useWatch({ name: "iftaari" });
  const chairs = useWatch({ name: "chairs" });
  const zabihat = useWatch({ name: "zabihat" });
  const previousHistory = useWatch({ name: "previousHistory" });
  const familyMembers = useWatch({ name: "familyMembers" });

  useEffect(() => {
    setValue("total", calcTotalPayable(currentEvent, { takhmeenAmount, iftaari, chairs, zabihat }));
  }, [takhmeenAmount, iftaari, chairs, zabihat]);

  useEffect(() => {
    const chairCount = familyMembers?.filter((member) => member.hasChair).length || 0;
    setValue("chairs", chairCount);
  }, [familyMembers]);
  return (
    <Grid container sx={{ mt: 3 }}>
      <Grid item size={{ md: 6, xs: 12 }} sx={{ pr: { xs: 0, md: 1 } }}>
        <Grid container>
          <Grid item size={{ xs: 12 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              HOF Details <HofLookup change={() => {}} />
            </Typography>
          </Grid>
          <Grid item size={{ md: 6, xs: 12 }} sx={{ pr: { xs: 0, md: 1 }, mb: { xs: 2, md: 3 } }}>
            <SelectInput
              source="markaz"
              label="Jaman Venue"
              helperText={`Select any one of ${Object.values(MARKAZ_LIST).join(", ")}`}
              choices={Object.entries(MARKAZ_LIST).map(([key, value]) => ({
                id: key,
                name: value,
              }))}
              fullWidth
              isRequired
              sx={{ mb: 0 }}
            />
          </Grid>
          <Grid item size={{ md: 6, xs: 12 }} sx={{ mb: { xs: 2, md: 3 } }}>
            <SelectInput
              source="namaazVenue"
              label="Namaaz Venue"
              helperText={`Select any one of ${Object.values(MARKAZ_LIST).join(", ")}`}
              choices={Object.entries(MARKAZ_LIST).map(([key, value]) => ({
                id: key,
                name: value,
              }))}
              fullWidth
              isRequired
              sx={{ mb: 0 }}
            />
          </Grid>
          <Grid item size={{ md: 6, xs: 12 }} sx={{ pr: { xs: 0, md: 1 }, mb: { xs: 2, md: 0 } }}>
            <TextInput source="HOFId" label="HOF ITS" fullWidth isRequired />
          </Grid>
          <Grid item size={{ md: 6, xs: 12 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <TextInput source="HOFName" label="Full Name" fullWidth isRequired />
          </Grid>
          <Grid item size={{ xs: 12 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <TextInput source="HOFAddress" label="Address" fullWidth isRequired />
          </Grid>
          <Grid item size={{ md: 6, xs: 12 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <TextInput source="HOFPhone" label="Phone" fullWidth isRequired />
          </Grid>
          <Grid item size={{ xs: 12 }}></Grid>

          <Grid item size={{ xs: 12 }} sx={{ mb: 2, mt: { xs: 1, md: 0 } }}>
            <Typography variant="body1">Takhmeen Details</Typography>
          </Grid>
          <Grid item size={{ md: 6, xs: 12 }} sx={{ pr: { xs: 0, md: 1 }, mb: { xs: 2, md: 0 } }}>
            <NoArrowKeyNumberInput source="takhmeenAmount" fullWidth defaultValue={0} />
          </Grid>
          <Grid item size={{ md: 6, xs: 12 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <NoArrowKeyNumberInput source="iftaari" fullWidth defaultValue={0} />
          </Grid>

          <Grid item size={{ md: 6, xs: 12 }} sx={{ pr: { xs: 0, md: 1 }, mb: { xs: 2, md: 0 } }}>
            <NoArrowKeyNumberInput
              source="zabihat"
              fullWidth
              defaultValue={0}
              min={0}
              helperText={`${zabihat} X ₹${currentEvent.zabihat} = ₹${
                zabihat * currentEvent.zabihat
              }`}
            />
          </Grid>
          <Grid item size={{ md: 6, xs: 12 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <NoArrowKeyNumberInput
              source="chairs"
              fullWidth
              defaultValue={0}
              helperText={`Toggle the chair selection per family member to add here. \n${chairs} X ₹${
                currentEvent.chairs
              } = ₹${chairs * currentEvent.chairs}`}
              min={0}
              sx={{ mb: { xs: 0, md: 2 } }}
              slotProps={{
                input: {
                  readOnly: true,
                  sx: {
                    opacity: 0.4,
                    pointerEvents: "none",
                    cursor: "default",
                    "&:hover": {
                      opacity: 0.4,
                    },
                  },
                },
              }}
            />
          </Grid>
          <Grid item size={{ xs: 12 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <NoArrowKeyNumberInput
              label="Total Payable"
              source="total"
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                  sx: {
                    opacity: 0.4,
                    pointerEvents: "none",
                    cursor: "default",
                    "&:hover": {
                      opacity: 0.4,
                    },
                  },
                },
              }}
              defaultValue={0}
            />
          </Grid>

          <Grid item size={{ xs: 12 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <NoArrowKeyNumberInput
              label="Paid Amount"
              source="paidAmount"
              fullWidth
              defaultValue={0}
            />
          </Grid>
          <Grid item size={{ md: 6, xs: 12 }} sx={{ mb: { xs: 2, md: 0 } }}>
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
          <Grid item size={{ md: 6, xs: 12 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <TextInput source="details" label="Payment Details" fullWidth />
          </Grid>

          <Grid item size={{ xs: 12 }} sx={{ mb: { xs: 2, md: 0 } }}>
            <TextInput source="comments" fullWidth />
          </Grid>

          <Grid item size={{ xs: 12 }} sx={{ mt: { xs: 2, md: 3 } }}>
            <BookedSlotsInput />
          </Grid>
        </Grid>
      </Grid>
      <Grid
        item
        size={{ md: 6, xs: 12 }}
        sx={{
          borderLeft: { xs: "none", md: "1px solid #cccccc" },
          pl: { xs: 0, md: 1 },
          mt: { xs: 3, md: 0 },
          pt: { xs: 2, md: 0 },
          borderTop: { xs: "1px solid #e0e0e0", md: "none" },
        }}
      >
        <Grid container>
          {previousHistory && (
            <Grid item size={{ xs: 12 }} sx={{ mb: 4 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Previous Takhmeen History
              </Typography>
              <ArrayField
                record={previousHistory || {}}
                source="rows"
                emptyText="No Previous Records Found"
              >
                <NiyaazDataGrid />
              </ArrayField>
            </Grid>
          )}
          <Grid item size={{ xs: 12 }}>
            <Typography variant="body1">Family Members</Typography>
            <ArrayInput source="familyMembers" fullWidth label="">
              <SimpleFormIterator inline fullWidth>
                <FormDataConsumer>
                  {() => (
                    <Grid container spacing={1} sx={{ my: 2 }}>
                      <Grid item size={{ xs: 12 }} sx={{ mb: 1 }}>
                        <TextInput source="name" helperText={false} fullWidth isRequired />
                      </Grid>
                      <Grid item size={{ md: 3, xs: 12 }} sx={{ mb: { xs: 1, md: 0 } }}>
                        <TextInput
                          source="its"
                          label="ITS"
                          helperText={false}
                          fullWidth
                          isRequired
                        />
                      </Grid>
                      <Grid item size={{ md: 3, xs: 12 }} sx={{ mb: { xs: 1, md: 0 } }}>
                        <TextInput source="age" helperText={false} fullWidth isRequired />
                      </Grid>
                      <Grid item size={{ md: 3, xs: 12 }} sx={{ mb: { xs: 1, md: 0 } }}>
                        <SelectInput
                          source="gender"
                          label="Gender"
                          helperText={false}
                          choices={[
                            { id: "Male", name: "Male" },
                            { id: "Female", name: "Female" },
                          ]}
                          fullWidth
                          isRequired
                        />
                      </Grid>
                      <Grid item size={{ md: 3, xs: 12 }}>
                        <BooleanInput
                          source="hasChair"
                          label="Chair"
                          fullWidth
                          sx={{ ml: { xs: 0, md: 6 } }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </FormDataConsumer>
              </SimpleFormIterator>
            </ArrayInput>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
