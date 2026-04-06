import Grid from "@mui/material/Grid";
import { Card, CardContent } from "@mui/material";
import type { useRedirect } from "react-admin";
import FmbTakhmeenAmountTable from "./FmbTakhmeenAmountTable";

type RedirectFn = ReturnType<typeof useRedirect>;

const CATEGORY_LABELS: Record<string, string> = {
  THALI: "Thali",
  ANNUAL: "Annual",
  ZABIHAT: "Zabihat",
  VOLUNTARY: "Voluntary",
};

type AmountRow = { amount: number; count: number; fmbIds?: string[] };

type FmbTakhmeenAmountTablesProps = {
  takhmeenAmountCountsByType: Record<string, AmountRow[]>;
  redirect: RedirectFn;
};

export default function FmbTakhmeenAmountTables({
  takhmeenAmountCountsByType,
  redirect,
}: FmbTakhmeenAmountTablesProps) {
  const keys = Object.keys(takhmeenAmountCountsByType || {});

  if (keys.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      {keys.map((key) => (
        <Grid
          key={key}
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Card elevation={2}>
            <CardContent>
              <FmbTakhmeenAmountTable
                categoryLabel={CATEGORY_LABELS[key] || key}
                data={takhmeenAmountCountsByType[key]}
                redirect={redirect}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
