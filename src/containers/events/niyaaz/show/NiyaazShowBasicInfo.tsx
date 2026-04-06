import {
  ArrayField,
  BooleanField,
  FunctionField,
  NumberField,
  SimpleShowLayout,
  TextField,
} from "react-admin";
import Grid from "@mui/material/Grid";
import { useMediaQuery } from "@mui/material";
import { NiyaazDataGrid } from "../common/NiyaazDataGrid";

export const NiyaazShowBasicInfo = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        <SimpleShowLayout>
          <TextField source="HOFName" label="Name" emptyText="-" />
          <TextField source="HOFId" label="ITS NO." />
          <TextField source="HOFPhone" label="Phone" />
          <BooleanField
            source="sendReminders"
            label="Send reminders"
            valueLabelTrue="Yes"
            valueLabelFalse="No"
          />
        </SimpleShowLayout>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <SimpleShowLayout
          direction={isSmall ? "row" : "column"}
          sx={isSmall ? { "& .RaSimpleShowLayout-stack": { justifyContent: "space-between" } } : {}}
        >
          <NumberField source="takhmeenAmount" label="Takhmeen" />
          <NumberField source="chairs" label="Chairs" />
          <NumberField source="iftaari" label="Iftaari" />
          <NumberField source="zabihat" label="Zabihat" />
        </SimpleShowLayout>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <SimpleShowLayout
          direction={isSmall ? "row" : "column"}
          sx={isSmall ? { "& .RaSimpleShowLayout-stack": { justifyContent: "space-between" } } : {}}
        >
          <FunctionField
            source="totalPayable"
            label="Total Payable"
            render={(record) => <h2>₹ {record.totalPayable || 0}</h2>}
          />
          <FunctionField
            source="paidAmount"
            label="Paid Amount"
            render={(record) => <h2>₹ {record.paidAmount || 0}</h2>}
          />
          <FunctionField
            source="balance"
            label="Pending Balance"
            render={(record) => <h2>₹ {record.balance || 0}</h2>}
          />
        </SimpleShowLayout>
      </Grid>
      <Grid
        sx={{ pt: 2, borderTop: "1px solid #efefef" }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <SimpleShowLayout>
          <ArrayField source="previousNiyaazHistory">
            <NiyaazDataGrid />
          </ArrayField>
        </SimpleShowLayout>
      </Grid>
    </Grid>
  );
};
