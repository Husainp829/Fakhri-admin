import { Card, CardContent } from "@mui/material";
import Grid from "@mui/material/Grid";
import TakhmeenAmountTable, { type TakhmeenAmountRow } from "./TakhmeenAmountTable";

type TakhmeenAmountTablesProps = {
  takhmeenAmountCountsByType: Record<string, TakhmeenAmountRow[]>;
  redirect: (path: string) => void;
};

const TakhmeenAmountTables = ({
  takhmeenAmountCountsByType,
  redirect,
}: TakhmeenAmountTablesProps) => {
  const sabilTypes = Object.keys(takhmeenAmountCountsByType);

  return (
    <Grid container spacing={2}>
      {sabilTypes.map((type) => (
        <Grid
          key={type}
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Card elevation={2}>
            <CardContent>
              <TakhmeenAmountTable
                sabilType={type}
                data={takhmeenAmountCountsByType[type]}
                redirect={redirect}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TakhmeenAmountTables;
