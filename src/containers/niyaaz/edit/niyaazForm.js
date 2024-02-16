import React, { useContext } from "react";
import {
  TextInput,
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
  FormDataConsumer,
  SelectInput,
} from "react-admin";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useWatch } from "react-hook-form";

import HofLookup from "../common/hofLookup";
import { calcTotalPayable } from "../../../utils";
import { EventContext } from "../../../dataprovider/eventProvider";

export default () => {
  const { currentEvent } = useContext(EventContext);
  const takhmeenAmount = useWatch({ name: "takhmeenAmount" });
  const iftaari = useWatch({ name: "iftaari" });
  const chairs = useWatch({ name: "chairs" });
  const zabihat = useWatch({ name: "zabihat" });
  const paidAmount = useWatch({ name: "paidAmount" });

  const payable = calcTotalPayable(currentEvent, {
    takhmeenAmount,
    iftaari,
    chairs,
    zabihat,
  });
  return (
    <Grid container spacing={1} sx={{ mt: 3 }}>
      <Grid item md={6} xs={12} sx={{ pr: 1 }}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              HOF Details <HofLookup change={() => {}} />
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <SelectInput
              source="markaz"
              label="Markaz"
              helperText="Select any one of Zainy Masjid Sehen, Burhani Hall"
              choices={[
                { id: "ZM", name: "Zainy Masjid Sehen" },
                { id: "BH", name: "Burhani Hall" },
              ]}
              fullWidth
              isRequired
              sx={{ mb: 3 }}
            />
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
          <Grid item xs={12}></Grid>

          <Grid item xs={12} sx={{ mb: 3 }}>
            <Typography variant="body1">Takhmeen Details</Typography>
          </Grid>
          <Grid item lg={6} xs={6}>
            <NumberInput source="takhmeenAmount" fullWidth defaultValue={0} min={0} />
          </Grid>
          <Grid item lg={6} xs={6}>
            <NumberInput source="iftaari" fullWidth defaultValue={0} min={0} />
          </Grid>
          <Grid item lg={6} xs={6}>
            <NumberInput
              source="zabihat"
              fullWidth
              defaultValue={0}
              min={0}
              helperText={`${zabihat} X ₹${currentEvent.zabihat} = ₹${
                zabihat * currentEvent.zabihat
              }`}
            />
          </Grid>
          <Grid item lg={6} xs={6}>
            <NumberInput
              source="chairs"
              fullWidth
              defaultValue={0}
              helperText={`${chairs} X ₹${currentEvent.chairs} = ₹${chairs * currentEvent.chairs}`}
              min={0}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item lg={12} xs={12} sx={{ mb: 3 }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 500 }} aria-label="simple table">
                <TableBody>
                  {[
                    {
                      title: "Total Payable",
                      amount: payable,
                    },
                    {
                      title: "Total Paid",
                      amount: paidAmount,
                    },
                    {
                      title: "Balance",
                      amount: payable - paidAmount,
                    },
                  ].map((row) => (
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
          <Grid item lg={12} xs={12}>
            <TextInput source="comments" fullWidth />
          </Grid>
        </Grid>
      </Grid>
      <Grid item md={6} xs={12} sx={{ borderLeft: "1px solid #cccccc", pl: 1 }}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body1">Family Members</Typography>
            <ArrayInput source="familyMembers" fullWidth label="">
              <SimpleFormIterator inline fullWidth>
                <FormDataConsumer>
                  {({ getSource }) => (
                    <Grid container spacing={1} sx={{ my: 2 }}>
                      <Grid item lg={12} xs={12} sx={{ mb: 1 }}>
                        <TextInput
                          source={getSource("name")}
                          helperText={false}
                          fullWidth
                          isRequired
                        />
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
                        <TextInput
                          source={getSource("age")}
                          helperText={false}
                          fullWidth
                          isRequired
                        />
                      </Grid>
                      <Grid item lg={4} xs={3}>
                        <SelectInput
                          source={getSource("gender")}
                          label="Gender"
                          helperText={false}
                          choices={[
                            { id: "Male", name: "Male" },
                            { id: "Female", name: "Female" },
                          ]}
                          fullWidth
                          isRequired
                          sx={{ mt: 0 }}
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
