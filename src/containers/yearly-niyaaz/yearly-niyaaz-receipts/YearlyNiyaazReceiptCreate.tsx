import { useEffect } from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  RadioButtonGroupInput,
  DateInput,
  required,
  minValue,
  useNotify,
} from "react-admin";
import Grid from "@mui/material/Grid";
import { TextField, Typography } from "@mui/material";
import { useWatch, useFormContext } from "react-hook-form";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import { callApi } from "@/dataprovider/misc-apis";
import type { RaRecord } from "react-admin";

const getYearlyNiyaazIdFromLocation = (): string | null => {
  if (typeof window === "undefined") return null;
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  return searchParams.get("yearlyNiyaazId");
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const ReceiptFormFields = ({ yearlyNiyaazId }: { yearlyNiyaazId: string | null }) => {
  const notify = useNotify();
  const { setValue } = useFormContext();
  const mode = useWatch({ name: "paymentMode" });
  const balance = useWatch({ name: "_balance" }) as number | undefined;

  useEffect(() => {
    if (!yearlyNiyaazId) return;
    const fetchData = async () => {
      try {
        const res = await callApi({
          location: "yearlyNiyaaz",
          method: "GET",
          id: yearlyNiyaazId,
        });
        const body = res.data as { count?: number; rows?: RaRecord[] };
        if ((body.count ?? 0) > 0) {
          const data = body.rows?.[0];
          if (data) {
            setValue("_formNo", data.formNo);
            setValue("_name", data.name);
            setValue("_itsNo", data.itsNo);
            setValue("_balance", data.balance);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        notify(message);
      }
    };
    void fetchData();
  }, [yearlyNiyaazId, notify, setValue]);

  return (
    <Grid container spacing={1}>
      <Grid size={{ lg: 4, xs: 12 }}>
        <TextField
          value={useWatch({ name: "_formNo" }) || ""}
          label="Form No"
          fullWidth
          disabled
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
      <Grid size={{ lg: 4, xs: 12 }}>
        <TextField
          value={useWatch({ name: "_itsNo" }) || ""}
          label="ITS No"
          fullWidth
          disabled
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
      <Grid size={{ lg: 4, xs: 12 }}>
        <TextField
          value={useWatch({ name: "_name" }) || ""}
          label="Name"
          fullWidth
          disabled
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
      {balance !== undefined && (
        <Grid size={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Balance Pending: <strong>{formatCurrency(balance)}</strong>
          </Typography>
        </Grid>
      )}
      <Grid size={{ lg: 6, xs: 12 }}>
        <NoArrowKeyNumberInput
          source="amount"
          label="Amount"
          fullWidth
          validate={[required(), minValue(1, "Min value is 1")]}
        />
      </Grid>
      <Grid size={{ lg: 6, xs: 12 }}>
        <DateInput source="receiptDate" label="Receipt Date" fullWidth />
      </Grid>
      <Grid size={12}>
        <RadioButtonGroupInput
          sx={{ mt: 0 }}
          source="paymentMode"
          label="Payment Mode"
          choices={[
            { id: "CASH", name: "CASH" },
            { id: "ONLINE", name: "ONLINE" },
            { id: "CHEQUE", name: "CHEQUE" },
          ]}
          fullWidth
          validate={required()}
        />
      </Grid>
      {mode && mode !== "CASH" && (
        <Grid size={12}>
          <TextInput source="paymentRef" label="Payment Reference" fullWidth />
        </Grid>
      )}
      <Grid size={12}>
        <TextInput source="remarks" label="Remarks" fullWidth multiline />
      </Grid>
    </Grid>
  );
};

export const YearlyNiyaazReceiptCreate = () => {
  const yearlyNiyaazId = getYearlyNiyaazIdFromLocation();

  const transform = (data: Record<string, unknown>) => ({
    yearlyNiyaazId: data.yearlyNiyaazId,
    amount: Number(data.amount),
    paymentMode: data.paymentMode,
    paymentRef: data.paymentRef || undefined,
    receiptDate: data.receiptDate || undefined,
    remarks: data.remarks || undefined,
  });

  const validate = (values: Record<string, unknown>) => {
    const errors: Record<string, string> = {};
    if (!values.amount) errors.amount = "Amount is required";
    if (!values.paymentMode) errors.paymentMode = "Payment mode is required";
    return errors;
  };

  return (
    <Create
      transform={transform}
      redirect={() => `yearlyNiyaaz/${yearlyNiyaazId ?? ""}/show/receipts`}
    >
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={{ yearlyNiyaazId, paymentMode: "CASH" }}
        validate={validate}
      >
        <ReceiptFormFields yearlyNiyaazId={yearlyNiyaazId} />
      </SimpleForm>
    </Create>
  );
};

export default YearlyNiyaazReceiptCreate;
