import { useEffect } from "react";
import {
  TextInput,
  ArrayInput,
  SimpleFormIterator,
  FormDataConsumer,
  SelectInput,
  BooleanInput,
  useStore,
} from "react-admin";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useWatch, useFormContext } from "react-hook-form";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import NiyaazHofLookup from "../common/NiyaazHofLookup";
import NiyaazBookedSlotsInput from "../common/NiyaazBookedSlotsInput";
import { calcTotalPayable } from "@/utils";
import { MARKAZ_LIST } from "@/constants";
import type { CurrentEvent } from "@/containers/events/types";

type FamilyMemberRow = { hasChair?: boolean };

export const NiyaazEditForm = () => {
  const { setValue } = useFormContext();

  const [currentEvent] = useStore<CurrentEvent | null>("currentEvent");
  const takhmeenAmount = useWatch({ name: "takhmeenAmount" });
  const iftaari = useWatch({ name: "iftaari" });
  const chairs = useWatch({ name: "chairs" });
  const zabihat = useWatch({ name: "zabihat" });
  const paidAmount = useWatch({ name: "paidAmount" });
  const familyMembers = useWatch({ name: "familyMembers" }) as FamilyMemberRow[] | undefined;

  const ez = currentEvent?.zabihat ?? 0;
  const ec = currentEvent?.chairs ?? 0;

  const payable = calcTotalPayable(currentEvent ?? {}, {
    takhmeenAmount,
    iftaari,
    chairs,
    zabihat,
  });

  useEffect(() => {
    const chairCount = familyMembers?.filter((member) => member.hasChair).length || 0;
    setValue("chairs", chairCount);
  }, [familyMembers, setValue]);

  return (
    <Grid container spacing={1} sx={{ mt: 3 }}>
      <Grid
        sx={{ pr: { xs: 0, md: 1 } }}
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Grid container>
          <Grid size={12}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              HOF Details <NiyaazHofLookup />
            </Typography>
          </Grid>
          <Grid
            sx={{ pr: { xs: 0, md: 1 }, mb: { xs: 2, md: 3 } }}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <SelectInput
              source="markaz"
              label="Jaman Venue"
              helperText="Select any one of Fakhri Manzil, Zainy Masjid Sehen, Burhani Hall"
              choices={Object.entries(MARKAZ_LIST).map(([key, value]) => ({
                id: key,
                name: value,
              }))}
              fullWidth
              isRequired
              sx={{ mb: 0 }}
            />
          </Grid>
          <Grid
            sx={{ mb: { xs: 2, md: 3 } }}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <SelectInput
              source="namaazVenue"
              label="Namaaz Venue"
              helperText="Select any one of Fakhri Manzil, Zainy Masjid, Burhani Hall"
              choices={Object.entries(MARKAZ_LIST).map(([key, value]) => ({
                id: key,
                name: value,
              }))}
              fullWidth
              isRequired
              sx={{ mb: 0 }}
            />
          </Grid>
          <Grid
            sx={{ pr: { xs: 0, md: 1 }, mb: { xs: 2, md: 0 } }}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextInput source="HOFId" label="HOF ITS" fullWidth isRequired />
          </Grid>
          <Grid
            sx={{ mb: { xs: 2, md: 0 } }}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextInput source="HOFName" label="Full Name" fullWidth isRequired />
          </Grid>
          <Grid sx={{ mb: { xs: 2, md: 0 } }} size={12}>
            <TextInput source="HOFAddress" label="Address" fullWidth isRequired />
          </Grid>
          <Grid
            sx={{ mb: { xs: 2, md: 0 } }}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextInput source="HOFPhone" label="Phone" fullWidth isRequired />
          </Grid>
          <Grid sx={{ mb: 2 }} size={12}>
            <BooleanInput
              source="sendReminders"
              label="Send reminders"
              fullWidth
              helperText="Send WhatsApp contribution reminder messages for outstanding balance"
            />
          </Grid>
          <Grid size={12} />

          <Grid sx={{ mb: 2, mt: { xs: 1, md: 0 } }} size={12}>
            <Typography variant="body1">Takhmeen Details</Typography>
          </Grid>
          <Grid
            sx={{ pr: { xs: 0, md: 1 }, mb: { xs: 2, md: 0 } }}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <NoArrowKeyNumberInput source="takhmeenAmount" fullWidth defaultValue={0} />
          </Grid>
          <Grid
            sx={{ mb: { xs: 2, md: 0 } }}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <NoArrowKeyNumberInput source="iftaari" fullWidth defaultValue={0} />
          </Grid>
          <Grid
            sx={{ pr: { xs: 0, md: 1 }, mb: { xs: 2, md: 0 } }}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <NoArrowKeyNumberInput
              source="zabihat"
              fullWidth
              defaultValue={0}
              helperText={`${zabihat} X ₹${ez} = ₹${Number(zabihat) * ez}`}
            />
          </Grid>
          <Grid
            sx={{ mb: { xs: 2, md: 0 } }}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <NoArrowKeyNumberInput
              source="chairs"
              fullWidth
              defaultValue={0}
              helperText={`${chairs} X ₹${ec} = ₹${Number(chairs) * ec}`}
              sx={{ mb: { xs: 0, md: 2 } }}
              disabled
            />
          </Grid>
          <Grid sx={{ mb: { xs: 2, md: 3 } }} size={12}>
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 280 }} aria-label="simple table">
                <TableBody>
                  {(
                    [
                      { title: "Total Payable", amount: payable },
                      { title: "Total Paid", amount: Number(paidAmount) || 0 },
                      { title: "Balance", amount: payable - (Number(paidAmount) || 0) },
                    ] as const
                  ).map((row) => (
                    <TableRow
                      key={row.title}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.title}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1">
                          <b>₹{row.amount}</b>
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid sx={{ mb: { xs: 2, md: 0 } }} size={12}>
            <TextInput source="comments" fullWidth />
          </Grid>

          <Grid sx={{ mt: { xs: 2, md: 3 } }} size={12}>
            <NiyaazBookedSlotsInput />
          </Grid>
        </Grid>
      </Grid>
      <Grid
        sx={{
          borderLeft: { xs: "none", md: "1px solid #cccccc" },
          pl: { xs: 0, md: 1 },
          mt: { xs: 3, md: 0 },
          pt: { xs: 2, md: 0 },
          borderTop: { xs: "1px solid #e0e0e0", md: "none" },
        }}
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Grid container>
          <Grid size={12}>
            <Typography variant="body1">Family Members</Typography>
            <ArrayInput source="familyMembers" fullWidth label="">
              <SimpleFormIterator inline fullWidth>
                <FormDataConsumer>
                  {() => (
                    <Grid container spacing={1} sx={{ my: 2 }}>
                      <Grid sx={{ mb: 1 }} size={12}>
                        <TextInput source="name" helperText={false} fullWidth isRequired />
                      </Grid>
                      <Grid
                        sx={{ mb: { xs: 1, md: 0 } }}
                        size={{
                          xs: 12,
                          md: 3,
                        }}
                      >
                        <TextInput
                          source="its"
                          label="ITS"
                          helperText={false}
                          fullWidth
                          isRequired
                        />
                      </Grid>
                      <Grid
                        sx={{ mb: { xs: 1, md: 0 } }}
                        size={{
                          xs: 12,
                          md: 3,
                        }}
                      >
                        <TextInput source="age" helperText={false} fullWidth isRequired />
                      </Grid>
                      <Grid
                        sx={{ mb: { xs: 1, md: 0 } }}
                        size={{
                          xs: 12,
                          md: 3,
                        }}
                      >
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
                      <Grid
                        size={{
                          xs: 12,
                          md: 3,
                        }}
                      >
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
